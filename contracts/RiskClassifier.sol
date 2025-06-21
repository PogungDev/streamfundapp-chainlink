// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RiskClassifier is Ownable {
    enum RiskLevel {
        VERY_LOW,    // 0-20%
        LOW,         // 21-40%
        MEDIUM,      // 41-60%
        HIGH,        // 61-80%
        VERY_HIGH    // 81-100%
    }
    
    struct RiskAssessment {
        uint256 vaultId;
        RiskLevel riskLevel;
        uint256 riskScore;
        uint256 volatilityScore;
        uint256 liquidityScore;
        uint256 reputationScore;
        string riskFactors;
        uint256 timestamp;
    }
    
    mapping(uint256 => RiskAssessment) public vaultRisks;
    mapping(string => uint256) public categoryRiskWeights;
    
    event RiskAssessed(uint256 indexed vaultId, RiskLevel riskLevel, uint256 score);
    event RiskUpdated(uint256 indexed vaultId, RiskLevel oldLevel, RiskLevel newLevel);
    
    constructor() {
        // Initialize category risk weights
        categoryRiskWeights["Gaming"] = 70; // Higher risk
        categoryRiskWeights["Music"] = 50;  // Medium risk
        categoryRiskWeights["Education"] = 30; // Lower risk
        categoryRiskWeights["Tech"] = 60;   // Medium-high risk
        categoryRiskWeights["Lifestyle"] = 40; // Medium-low risk
    }
    
    function assessRisk(
        uint256 _vaultId,
        string memory _category,
        uint256 _channelAge,
        uint256 _subscribers,
        uint256 _avgViews,
        uint256 _revenueVolatility
    ) external onlyOwner returns (RiskLevel) {
        // Calculate individual risk components
        uint256 categoryRisk = categoryRiskWeights[_category];
        
        // Channel age risk (newer = higher risk)
        uint256 ageRisk = _channelAge < 12 ? 80 : (_channelAge < 24 ? 50 : 20);
        
        // Subscriber risk (fewer = higher risk)
        uint256 subRisk = _subscribers < 10000 ? 70 : (_subscribers < 100000 ? 40 : 10);
        
        // View consistency risk
        uint256 viewRisk = _avgViews < 1000 ? 80 : (_avgViews < 10000 ? 50 : 20);
        
        // Revenue volatility risk
        uint256 volatilityRisk = _revenueVolatility > 50 ? 90 : (_revenueVolatility > 30 ? 60 : 30);
        
        // Calculate weighted risk score
        uint256 totalRiskScore = (
            (categoryRisk * 20) +
            (ageRisk * 25) +
            (subRisk * 20) +
            (viewRisk * 15) +
            (volatilityRisk * 20)
        ) / 100;
        
        RiskLevel riskLevel = calculateRiskLevel(totalRiskScore);
        
        vaultRisks[_vaultId] = RiskAssessment({
            vaultId: _vaultId,
            riskLevel: riskLevel,
            riskScore: totalRiskScore,
            volatilityScore: _revenueVolatility,
            liquidityScore: calculateLiquidityScore(_subscribers, _avgViews),
            reputationScore: calculateReputationScore(_channelAge, _subscribers),
            riskFactors: generateRiskFactors(categoryRisk, ageRisk, subRisk, viewRisk, volatilityRisk),
            timestamp: block.timestamp
        });
        
        emit RiskAssessed(_vaultId, riskLevel, totalRiskScore);
        return riskLevel;
    }
    
    function calculateRiskLevel(uint256 _score) internal pure returns (RiskLevel) {
        if (_score <= 20) return RiskLevel.VERY_LOW;
        if (_score <= 40) return RiskLevel.LOW;
        if (_score <= 60) return RiskLevel.MEDIUM;
        if (_score <= 80) return RiskLevel.HIGH;
        return RiskLevel.VERY_HIGH;
    }
    
    function calculateLiquidityScore(uint256 _subscribers, uint256 _avgViews) internal pure returns (uint256) {
        // Higher subscribers and views = better liquidity
        if (_subscribers > 1000000 && _avgViews > 100000) return 90;
        if (_subscribers > 100000 && _avgViews > 10000) return 70;
        if (_subscribers > 10000 && _avgViews > 1000) return 50;
        return 30;
    }
    
    function calculateReputationScore(uint256 _channelAge, uint256 _subscribers) internal pure returns (uint256) {
        // Older channels with more subscribers = better reputation
        uint256 ageScore = _channelAge > 36 ? 40 : (_channelAge > 12 ? 25 : 10);
        uint256 subScore = _subscribers > 1000000 ? 50 : (_subscribers > 100000 ? 35 : 20);
        return ageScore + subScore;
    }
    
    function generateRiskFactors(
        uint256 _categoryRisk,
        uint256 _ageRisk,
        uint256 _subRisk,
        uint256 _viewRisk,
        uint256 _volatilityRisk
    ) internal pure returns (string memory) {
        if (_volatilityRisk > 70) return "High revenue volatility, market uncertainty";
        if (_ageRisk > 60) return "New channel, limited track record";
        if (_subRisk > 60) return "Small audience, growth dependency";
        if (_viewRisk > 60) return "Low engagement, content risk";
        return "Standard market risks apply";
    }
    
    function getRiskAssessment(uint256 _vaultId) external view returns (RiskAssessment memory) {
        return vaultRisks[_vaultId];
    }
}
