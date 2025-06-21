// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PayoutSimulator is Ownable {
    struct PayoutSchedule {
        uint256 vaultId;
        address investor;
        uint256 monthlyAmount;
        uint256 nextPayoutTime;
        uint256 totalPayouts;
        uint256 remainingPayouts;
        bool isActive;
    }
    
    mapping(address => mapping(uint256 => PayoutSchedule)) public payoutSchedules;
    mapping(uint256 => uint256) public lastPayoutTime;
    
    uint256 public constant PAYOUT_INTERVAL = 30 days; // Monthly payouts
    
    event PayoutScheduled(address indexed investor, uint256 vaultId, uint256 monthlyAmount);
    event PayoutExecuted(address indexed investor, uint256 vaultId, uint256 amount);
    event AutoPayoutTriggered(uint256 vaultId, uint256 totalAmount);
    
    function schedulePayouts(
        address _investor,
        uint256 _vaultId,
        uint256 _monthlyAmount,
        uint256 _duration
    ) external onlyOwner {
        uint256 totalPayouts = _duration; // Duration in months
        
        payoutSchedules[_investor][_vaultId] = PayoutSchedule({
            vaultId: _vaultId,
            investor: _investor,
            monthlyAmount: _monthlyAmount,
            nextPayoutTime: block.timestamp + PAYOUT_INTERVAL,
            totalPayouts: totalPayouts,
            remainingPayouts: totalPayouts,
            isActive: true
        });
        
        emit PayoutScheduled(_investor, _vaultId, _monthlyAmount);
    }
    
    function simulateAutoPayout(uint256 _vaultId) external onlyOwner {
        lastPayoutTime[_vaultId] = block.timestamp;
        
        // Simulate payout to all investors in this vault
        uint256 totalPayout = 1000 * 10**6; // Mock 1000 USDC total payout
        emit AutoPayoutTriggered(_vaultId, totalPayout);
    }
    
    function executePayout(address _investor, uint256 _vaultId) external onlyOwner {
        PayoutSchedule storage schedule = payoutSchedules[_investor][_vaultId];
        require(schedule.isActive, "Payout not active");
        require(block.timestamp >= schedule.nextPayoutTime, "Not time for payout");
        require(schedule.remainingPayouts > 0, "No remaining payouts");
        
        schedule.nextPayoutTime += PAYOUT_INTERVAL;
        schedule.remainingPayouts--;
        
        if (schedule.remainingPayouts == 0) {
            schedule.isActive = false;
        }
        
        emit PayoutExecuted(_investor, _vaultId, schedule.monthlyAmount);
    }
    
    function getPayoutSchedule(address _investor, uint256 _vaultId) external view returns (PayoutSchedule memory) {
        return payoutSchedules[_investor][_vaultId];
    }
}
