// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract YieldTracker is Ownable {
    struct YieldData {
        uint256 vaultId;
        address investor;
        uint256 investedAmount;
        uint256 currentValue;
        uint256 accumulatedYield;
        uint256 lastUpdateTime;
        uint256 targetAPR;
        bool isActive;
    }
    
    mapping(address => mapping(uint256 => YieldData)) public investorYields;
    mapping(uint256 => address[]) public vaultInvestors;
    mapping(address => uint256[]) public investorVaults;
    
    event YieldUpdated(address indexed investor, uint256 vaultId, uint256 newYield);
    event YieldClaimed(address indexed investor, uint256 vaultId, uint256 amount);
    
    function trackInvestment(
        address _investor,
        uint256 _vaultId,
        uint256 _amount,
        uint256 _targetAPR
    ) external onlyOwner {
        investorYields[_investor][_vaultId] = YieldData({
            vaultId: _vaultId,
            investor: _investor,
            investedAmount: _amount,
            currentValue: _amount,
            accumulatedYield: 0,
            lastUpdateTime: block.timestamp,
            targetAPR: _targetAPR,
            isActive: true
        });
        
        vaultInvestors[_vaultId].push(_investor);
        investorVaults[_investor].push(_vaultId);
    }
    
    function simulateYield(address _investor, uint256 _vaultId) external onlyOwner {
        YieldData storage yieldData = investorYields[_investor][_vaultId];
        require(yieldData.isActive, "Investment not active");
        
        uint256 timeElapsed = block.timestamp - yieldData.lastUpdateTime;
        uint256 annualYield = (yieldData.investedAmount * yieldData.targetAPR) / 100;
        uint256 yieldIncrease = (annualYield * timeElapsed) / (365 * 24 * 3600);
        
        yieldData.accumulatedYield += yieldIncrease;
        yieldData.currentValue = yieldData.investedAmount + yieldData.accumulatedYield;
        yieldData.lastUpdateTime = block.timestamp;
        
        emit YieldUpdated(_investor, _vaultId, yieldData.accumulatedYield);
    }
    
    function getYieldData(address _investor, uint256 _vaultId) external view returns (YieldData memory) {
        return investorYields[_investor][_vaultId];
    }
}
