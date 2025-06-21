// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AutoCompounder is Ownable, ReentrancyGuard {
    struct CompoundingVault {
        uint256 vaultId;
        address investor;
        uint256 principal;
        uint256 compoundedAmount;
        uint256 baseAPR;
        uint256 compoundingFrequency; // times per year
        uint256 lastCompoundTime;
        uint256 totalCompounds;
        bool isActive;
        uint256 startTime;
    }
    
    mapping(address => mapping(uint256 => CompoundingVault)) public compoundingVaults;
    mapping(address => uint256[]) public investorVaults;
    mapping(uint256 => address[]) public vaultInvestors;
    
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 3600;
    uint256 public compoundingFee = 50; // 0.5% fee for auto-compounding
    
    event CompoundingEnabled(address indexed investor, uint256 vaultId, uint256 frequency);
    event YieldCompounded(address indexed investor, uint256 vaultId, uint256 newAmount);
    event CompoundingDisabled(address indexed investor, uint256 vaultId);
    
    function enableAutoCompounding(
        address _investor,
        uint256 _vaultId,
        uint256 _principal,
        uint256 _baseAPR,
        uint256 _compoundingFrequency
    ) external onlyOwner {
        require(_compoundingFrequency > 0 && _compoundingFrequency <= 365, "Invalid frequency");
        require(compoundingVaults[_investor][_vaultId].vaultId == 0, "Already enabled");
        
        compoundingVaults[_investor][_vaultId] = CompoundingVault({
            vaultId: _vaultId,
            investor: _investor,
            principal: _principal,
            compoundedAmount: _principal,
            baseAPR: _baseAPR,
            compoundingFrequency: _compoundingFrequency,
            lastCompoundTime: block.timestamp,
            totalCompounds: 0,
            isActive: true,
            startTime: block.timestamp
        });
        
        investorVaults[_investor].push(_vaultId);
        vaultInvestors[_vaultId].push(_investor);
        
        emit CompoundingEnabled(_investor, _vaultId, _compoundingFrequency);
    }
    
    function executeCompounding(address _investor, uint256 _vaultId) external onlyOwner nonReentrant {
        CompoundingVault storage vault = compoundingVaults[_investor][_vaultId];
        require(vault.isActive, "Compounding not active");
        
        uint256 timeSinceLastCompound = block.timestamp - vault.lastCompoundTime;
        uint256 compoundInterval = SECONDS_PER_YEAR / vault.compoundingFrequency;
        
        require(timeSinceLastCompound >= compoundInterval, "Too early to compound");
        
        // Calculate compound interest
        uint256 newAmount = calculateCompoundInterest(
            vault.compoundedAmount,
            vault.baseAPR,
            vault.compoundingFrequency,
            1 // Number of periods since last compound
        );
        
        // Apply compounding fee
        uint256 yieldGained = newAmount - vault.compoundedAmount;
        uint256 fee = (yieldGained * compoundingFee) / 10000;
        uint256 netNewAmount = newAmount - fee;
        
        vault.compoundedAmount = netNewAmount;
        vault.lastCompoundTime = block.timestamp;
        vault.totalCompounds++;
        
        emit YieldCompounded(_investor, _vaultId, netNewAmount);
    }
    
    function calculateCompoundInterest(
        uint256 _principal,
        uint256 _annualRate,
        uint256 _compoundingFrequency,
        uint256 _periods
    ) public pure returns (uint256) {
        // Formula: A = P(1 + r/n)^(nt)
        // Where: P = principal, r = annual rate, n = compounding frequency, t = time periods
        
        uint256 rate = _annualRate; // Rate in basis points (e.g., 800 = 8%)
        uint256 ratePerPeriod = rate / _compoundingFrequency; // Rate per compounding period
        
        // Simplified compound calculation (avoiding complex exponentiation)
        uint256 compoundedAmount = _principal;
        
        for (uint256 i = 0; i < _periods; i++) {
            uint256 interest = (compoundedAmount * ratePerPeriod) / 10000;
            compoundedAmount += interest;
        }
        
        return compoundedAmount;
    }
    
    function simulateCompounding(
        uint256 _principal,
        uint256 _annualAPR,
        uint256 _compoundingFrequency,
        uint256 _years
    ) external pure returns (uint256) {
        uint256 totalPeriods = _years * _compoundingFrequency;
        return calculateCompoundInterest(_principal, _annualAPR, _compoundingFrequency, totalPeriods);
    }
    
    function getProjectedYield(
        address _investor,
        uint256 _vaultId,
        uint256 _years
    ) external view returns (uint256) {
        CompoundingVault memory vault = compoundingVaults[_investor][_vaultId];
        require(vault.isActive, "Vault not active");
        
        uint256 totalPeriods = _years * vault.compoundingFrequency;
        return calculateCompoundInterest(
            vault.compoundedAmount,
            vault.baseAPR,
            vault.compoundingFrequency,
            totalPeriods
        );
    }
    
    function disableAutoCompounding(address _investor, uint256 _vaultId) external onlyOwner {
        CompoundingVault storage vault = compoundingVaults[_investor][_vaultId];
        require(vault.isActive, "Already disabled");
        
        vault.isActive = false;
        emit CompoundingDisabled(_investor, _vaultId);
    }
    
    function getCompoundingVault(address _investor, uint256 _vaultId) external view returns (CompoundingVault memory) {
        return compoundingVaults[_investor][_vaultId];
    }
    
    function getInvestorVaults(address _investor) external view returns (uint256[] memory) {
        return investorVaults[_investor];
    }
}
