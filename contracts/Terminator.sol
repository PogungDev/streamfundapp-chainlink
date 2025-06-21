// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Terminator is Ownable, ReentrancyGuard {
    enum TerminationReason {
        MATURITY,           // Natural expiration
        EARLY_TERMINATION,  // Creator initiated
        FORCE_LIQUIDATION,  // Risk-based termination
        CONSENSUS,          // Community vote
        EMERGENCY           // Emergency stop
    }
    
    struct TerminationSchedule {
        uint256 vaultId;
        uint256 scheduledTime;
        uint256 actualTime;
        TerminationReason reason;
        bool isExecuted;
        uint256 finalPayout;
        address[] investors;
        uint256[] payoutAmounts;
    }
    
    struct VaultTermination {
        uint256 vaultId;
        bool canTerminateEarly;
        uint256 earlyTerminationFee; // Basis points
        uint256 minimumNoticePeriod; // Seconds
        uint256 maturityDate;
        bool isActive;
    }
    
    mapping(uint256 => VaultTermination) public vaultTerminations;
    mapping(uint256 => TerminationSchedule) public terminationSchedules;
    mapping(uint256 => bool) public isVaultTerminated;
    
    uint256 public constant DEFAULT_EARLY_FEE = 500; // 5%
    uint256 public constant DEFAULT_NOTICE_PERIOD = 7 days;
    
    event TerminationScheduled(uint256 indexed vaultId, uint256 scheduledTime, TerminationReason reason);
    event VaultTerminated(uint256 indexed vaultId, TerminationReason reason, uint256 finalPayout);
    event EarlyTerminationRequested(uint256 indexed vaultId, uint256 requestTime);
    
    function initializeVaultTermination(
        uint256 _vaultId,
        bool _canTerminateEarly,
        uint256 _earlyTerminationFee,
        uint256 _minimumNoticePeriod,
        uint256 _maturityDate
    ) external onlyOwner {
        vaultTerminations[_vaultId] = VaultTermination({
            vaultId: _vaultId,
            canTerminateEarly: _canTerminateEarly,
            earlyTerminationFee: _earlyTerminationFee > 0 ? _earlyTerminationFee : DEFAULT_EARLY_FEE,
            minimumNoticePeriod: _minimumNoticePeriod > 0 ? _minimumNoticePeriod : DEFAULT_NOTICE_PERIOD,
            maturityDate: _maturityDate,
            isActive: true
        });
    }
    
    function scheduleTermination(
        uint256 _vaultId,
        uint256 _scheduledTime,
        TerminationReason _reason,
        address[] memory _investors,
        uint256[] memory _payoutAmounts
    ) external onlyOwner {
        require(vaultTerminations[_vaultId].isActive, "Vault not active");
        require(_investors.length == _payoutAmounts.length, "Array length mismatch");
        require(!isVaultTerminated[_vaultId], "Vault already terminated");
        
        if (_reason == TerminationReason.EARLY_TERMINATION) {
            require(vaultTerminations[_vaultId].canTerminateEarly, "Early termination not allowed");
            require(_scheduledTime >= block.timestamp + vaultTerminations[_vaultId].minimumNoticePeriod, "Insufficient notice period");
        }
        
        uint256 totalPayout = 0;
        for (uint256 i = 0; i < _payoutAmounts.length; i++) {
            totalPayout += _payoutAmounts[i];
        }
        
        terminationSchedules[_vaultId] = TerminationSchedule({
            vaultId: _vaultId,
            scheduledTime: _scheduledTime,
            actualTime: 0,
            reason: _reason,
            isExecuted: false,
            finalPayout: totalPayout,
            investors: _investors,
            payoutAmounts: _payoutAmounts
        });
        
        emit TerminationScheduled(_vaultId, _scheduledTime, _reason);
    }
    
    function executeTermination(uint256 _vaultId) external onlyOwner nonReentrant {
        TerminationSchedule storage schedule = terminationSchedules[_vaultId];
        require(!schedule.isExecuted, "Already executed");
        require(block.timestamp >= schedule.scheduledTime, "Not time to execute");
        require(!isVaultTerminated[_vaultId], "Already terminated");
        
        // Apply early termination fee if applicable
        uint256 finalPayout = schedule.finalPayout;
        if (schedule.reason == TerminationReason.EARLY_TERMINATION) {
            uint256 fee = (finalPayout * vaultTerminations[_vaultId].earlyTerminationFee) / 10000;
            finalPayout -= fee;
        }
        
        // Mark as executed
        schedule.isExecuted = true;
        schedule.actualTime = block.timestamp;
        schedule.finalPayout = finalPayout;
        
        // Mark vault as terminated
        isVaultTerminated[_vaultId] = true;
        vaultTerminations[_vaultId].isActive = false;
        
        emit VaultTerminated(_vaultId, schedule.reason, finalPayout);
    }
    
    function requestEarlyTermination(uint256 _vaultId) external onlyOwner {
        require(vaultTerminations[_vaultId].canTerminateEarly, "Early termination not allowed");
        require(vaultTerminations[_vaultId].isActive, "Vault not active");
        require(!isVaultTerminated[_vaultId], "Already terminated");
        
        emit EarlyTerminationRequested(_vaultId, block.timestamp);
    }
    
    function emergencyTermination(
        uint256 _vaultId,
        address[] memory _investors,
        uint256[] memory _payoutAmounts
    ) external onlyOwner {
        require(vaultTerminations[_vaultId].isActive, "Vault not active");
        require(!isVaultTerminated[_vaultId], "Already terminated");
        
        uint256 totalPayout = 0;
        for (uint256 i = 0; i < _payoutAmounts.length; i++) {
            totalPayout += _payoutAmounts[i];
        }
        
        terminationSchedules[_vaultId] = TerminationSchedule({
            vaultId: _vaultId,
            scheduledTime: block.timestamp,
            actualTime: block.timestamp,
            reason: TerminationReason.EMERGENCY,
            isExecuted: true,
            finalPayout: totalPayout,
            investors: _investors,
            payoutAmounts: _payoutAmounts
        });
        
        isVaultTerminated[_vaultId] = true;
        vaultTerminations[_vaultId].isActive = false;
        
        emit VaultTerminated(_vaultId, TerminationReason.EMERGENCY, totalPayout);
    }
    
    function getTerminationSchedule(uint256 _vaultId) external view returns (TerminationSchedule memory) {
        return terminationSchedules[_vaultId];
    }
    
    function canTerminateNow(uint256 _vaultId) external view returns (bool) {
        if (isVaultTerminated[_vaultId]) return false;
        if (!vaultTerminations[_vaultId].isActive) return false;
        
        TerminationSchedule memory schedule = terminationSchedules[_vaultId];
        if (schedule.vaultId == 0) return false; // No schedule set
        
        return block.timestamp >= schedule.scheduledTime && !schedule.isExecuted;
    }
}
