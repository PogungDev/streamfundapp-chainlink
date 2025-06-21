// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ForecastVault is Ownable {
    struct Forecast {
        uint256 estimatedRevenue;
        uint256 confidence;
        uint256 duration;
        uint256 riskScore;
        uint256 timestamp;
        bool isActive;
    }
    
    struct CreatorData {
        string channelId;
        uint256 subscribers;
        uint256 avgViews;
        uint256 cpm;
        uint256 channelAge;
    }
    
    mapping(address => Forecast) public creatorForecasts;
    mapping(address => CreatorData) public creatorData;
    
    event ForecastGenerated(address indexed creator, uint256 revenue, uint256 confidence);
    event CreatorDataUpdated(address indexed creator, string channelId);
    
    function generateForecast(
        string memory _channelId,
        uint256 _subscribers,
        uint256 _avgViews,
        uint256 _cpm,
        uint256 _channelAge
    ) external returns (uint256) {
        // Formula: estRev = (views × cpm × days) / 1000
        uint256 dailyRevenue = (_avgViews * _cpm) / 1000;
        uint256 monthlyRevenue = dailyRevenue * 30;
        
        // Risk calculation based on channel age and volatility
        uint256 riskScore = _channelAge < 12 ? 80 : 40; // Higher risk for new channels
        
        // Confidence based on data quality
        uint256 confidence = _subscribers > 100000 ? 85 : 70;
        
        creatorData[msg.sender] = CreatorData({
            channelId: _channelId,
            subscribers: _subscribers,
            avgViews: _avgViews,
            cpm: _cpm,
            channelAge: _channelAge
        });
        
        creatorForecasts[msg.sender] = Forecast({
            estimatedRevenue: monthlyRevenue,
            confidence: confidence,
            duration: 12, // 12 months default
            riskScore: riskScore,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit ForecastGenerated(msg.sender, monthlyRevenue, confidence);
        emit CreatorDataUpdated(msg.sender, _channelId);
        
        return monthlyRevenue;
    }
    
    function getForecast(address _creator) external view returns (Forecast memory) {
        return creatorForecasts[_creator];
    }
}
