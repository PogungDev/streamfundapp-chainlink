// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract APRScorer is Ownable {
    struct APRScore {
        uint256 baseAPR;
        uint256 riskAdjustedAPR;
        uint256 confidenceScore;
        uint256 marketScore;
        uint256 finalAPR;
        uint256 timestamp;
    }
    
    mapping(uint256 => APRScore) public vaultAPRScores;
    mapping(string => uint256) public categoryMultipliers;
    
    uint256 public constant BASE_APR = 800; // 8.00% base APR
    uint256 public constant MAX_APR = 2000; // 20.00% max APR
    
    event APRScored(uint256 indexed vaultId, uint256 finalAPR, uint256 confidence);
    event CategoryMultiplierUpdated(string category, uint256 multiplier);
    
    constructor() {
        // Initialize category multipliers (basis points)
        categoryMultipliers["Gaming"] = 150; // 1.5x multiplier
        categoryMultipliers["Music"] = 120; // 1.2x multiplier
        categoryMultipliers["Education"] = 100; // 1.0x multiplier
        categoryMultipliers["Tech"] = 140; // 1.4x multiplier
        categoryMultipliers["Lifestyle"] = 110; // 1.1x multiplier
    }
    
    function calculateAPR(
        uint256 _vaultId,
        uint256 _estimatedRevenue,
        uint256 _riskScore,
        uint256 _confidence,
        string memory _category
    ) external onlyOwner returns (uint256) {
        // Base APR calculation
        uint256 baseAPR = BASE_APR;
        
        // Risk adjustment (higher risk = higher APR)
        uint256 riskAdjustment = (_riskScore * 500) / 100; // Max 5% risk premium
        uint256 riskAdjustedAPR = baseAPR + riskAdjustment;
        
        // Confidence adjustment (higher confidence = more stable APR)
        uint256 confidenceAdjustment = (100 - _confidence) * 2; // Penalty for low confidence
        uint256 confidenceAdjustedAPR = riskAdjustedAPR + confidenceAdjustment;
        
        // Category multiplier
        uint256 multiplier = categoryMultipliers[_category];
        if (multiplier == 0) multiplier = 100; // Default 1.0x
        uint256 categoryAdjustedAPR = (confidenceAdjustedAPR * multiplier) / 100;
        
        // Market score (dummy - based on current demand)
        uint256 marketScore = 85; // Mock market score
        uint256 marketAdjustment = (marketScore * 100) / 100;
        
        // Final APR calculation
        uint256 finalAPR = categoryAdjustedAPR + marketAdjustment;
        
        // Cap at maximum APR
        if (finalAPR > MAX_APR) {
            finalAPR = MAX_APR;
        }
        
        vaultAPRScores[_vaultId] = APRScore({
            baseAPR: baseAPR,
            riskAdjustedAPR: riskAdjustedAPR,
            confidenceScore: _confidence,
            marketScore: marketScore,
            finalAPR: finalAPR,
            timestamp: block.timestamp
        });
        
        emit APRScored(_vaultId, finalAPR, _confidence);
        return finalAPR;
    }
    
    function getAPRScore(uint256 _vaultId) external view returns (APRScore memory) {
        return vaultAPRScores[_vaultId];
    }
    
    function updateCategoryMultiplier(string memory _category, uint256 _multiplier) external onlyOwner {
        categoryMultipliers[_category] = _multiplier;
        emit CategoryMultiplierUpdated(_category, _multiplier);
    }
}
