// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationVerifier is Ownable {
    struct ReputationData {
        address creator;
        string channelId;
        uint256 baseScore;
        uint256 performanceScore;
        uint256 communityScore;
        uint256 consistencyScore;
        uint256 totalScore;
        uint256 lastUpdated;
        bool isVerified;
    }
    
    struct PerformanceMetrics {
        uint256 totalVaults;
        uint256 successfulVaults;
        uint256 totalFunding;
        uint256 avgAPRDelivered;
        uint256 onTimePayouts;
        uint256 totalPayouts;
    }
    
    mapping(address => ReputationData) public creatorReputations;
    mapping(address => PerformanceMetrics) public creatorMetrics;
    mapping(string => address) public channelCreators;
    
    uint256 public constant MIN_VERIFICATION_SCORE = 70;
    uint256 public constant EXCELLENT_SCORE = 90;
    
    event ReputationCalculated(address indexed creator, uint256 totalScore);
    event CreatorVerified(address indexed creator, string channelId);
    event ReputationUpdated(address indexed creator, uint256 oldScore, uint256 newScore);
    
    function initializeCreatorReputation(
        address _creator,
        string memory _channelId,
        uint256 _subscribers,
        uint256 _channelAge,
        uint256 _avgViews
    ) external onlyOwner {
        require(creatorReputations[_creator].creator == address(0), "Creator already exists");
        
        // Calculate base score from channel metrics
        uint256 baseScore = calculateBaseScore(_subscribers, _channelAge, _avgViews);
        
        creatorReputations[_creator] = ReputationData({
            creator: _creator,
            channelId: _channelId,
            baseScore: baseScore,
            performanceScore: 0,
            communityScore: 0,
            consistencyScore: 0,
            totalScore: baseScore,
            lastUpdated: block.timestamp,
            isVerified: baseScore >= MIN_VERIFICATION_SCORE
        });
        
        channelCreators[_channelId] = _creator;
        
        if (baseScore >= MIN_VERIFICATION_SCORE) {
            emit CreatorVerified(_creator, _channelId);
        }
        
        emit ReputationCalculated(_creator, baseScore);
    }
    
    function updatePerformanceMetrics(
        address _creator,
        uint256 _totalVaults,
        uint256 _successfulVaults,
        uint256 _totalFunding,
        uint256 _avgAPRDelivered,
        uint256 _onTimePayouts,
        uint256 _totalPayouts
    ) external onlyOwner {
        creatorMetrics[_creator] = PerformanceMetrics({
            totalVaults: _totalVaults,
            successfulVaults: _successfulVaults,
            totalFunding: _totalFunding,
            avgAPRDelivered: _avgAPRDelivered,
            onTimePayouts: _onTimePayouts,
            totalPayouts: _totalPayouts
        });
        
        // Recalculate reputation with new performance data
        _updateReputationScore(_creator);
    }
    
    function _updateReputationScore(address _creator) internal {
        ReputationData storage reputation = creatorReputations[_creator];
        PerformanceMetrics memory metrics = creatorMetrics[_creator];
        
        uint256 oldScore = reputation.totalScore;
        
        // Calculate performance score (0-30 points)
        uint256 performanceScore = calculatePerformanceScore(metrics);
        
        // Calculate consistency score (0-20 points)
        uint256 consistencyScore = calculateConsistencyScore(metrics);
        
        // Community score (placeholder - would integrate with social metrics)
        uint256 communityScore = 15; // Mock community engagement score
        
        reputation.performanceScore = performanceScore;
        reputation.consistencyScore = consistencyScore;
        reputation.communityScore = communityScore;
        reputation.totalScore = reputation.baseScore + performanceScore + consistencyScore + communityScore;
        reputation.lastUpdated = block.timestamp;
        
        // Update verification status
        reputation.isVerified = reputation.totalScore >= MIN_VERIFICATION_SCORE;
        
        emit ReputationUpdated(_creator, oldScore, reputation.totalScore);
        
        if (reputation.isVerified && oldScore < MIN_VERIFICATION_SCORE) {
            emit CreatorVerified(_creator, reputation.channelId);
        }
    }
    
    function calculateBaseScore(
        uint256 _subscribers,
        uint256 _channelAge,
        uint256 _avgViews
    ) internal pure returns (uint256) {
        uint256 subScore = 0;
        if (_subscribers >= 1000000) subScore = 25;
        else if (_subscribers >= 100000) subScore = 20;
        else if (_subscribers >= 10000) subScore = 15;
        else if (_subscribers >= 1000) subScore = 10;
        else subScore = 5;
        
        uint256 ageScore = 0;
        if (_channelAge >= 60) ageScore = 15; // 5+ years
        else if (_channelAge >= 36) ageScore = 12; // 3+ years
        else if (_channelAge >= 24) ageScore = 10; // 2+ years
        else if (_channelAge >= 12) ageScore = 7;  // 1+ year
        else ageScore = 3;
        
        uint256 viewScore = 0;
        if (_avgViews >= 100000) viewScore = 10;
        else if (_avgViews >= 10000) viewScore = 8;
        else if (_avgViews >= 1000) viewScore = 6;
        else viewScore = 3;
        
        return subScore + ageScore + viewScore; // Max 50 points base score
    }
    
    function calculatePerformanceScore(PerformanceMetrics memory _metrics) internal pure returns (uint256) {
        if (_metrics.totalVaults == 0) return 0;
        
        // Success rate score (0-15 points)
        uint256 successRate = (_metrics.successfulVaults * 100) / _metrics.totalVaults;
        uint256 successScore = (successRate * 15) / 100;
        
        // Funding volume score (0-10 points)
        uint256 fundingScore = 0;
        if (_metrics.totalFunding >= 1000000) fundingScore = 10; // $1M+
        else if (_metrics.totalFunding >= 100000) fundingScore = 8; // $100K+
        else if (_metrics.totalFunding >= 10000) fundingScore = 6;  // $10K+
        else fundingScore = 3;
        
        // APR delivery score (0-5 points)
        uint256 aprScore = _metrics.avgAPRDelivered >= 800 ? 5 : 3; // 8%+ APR
        
        return successScore + fundingScore + aprScore; // Max 30 points
    }
    
    function calculateConsistencyScore(PerformanceMetrics memory _metrics) internal pure returns (uint256) {
        if (_metrics.totalPayouts == 0) return 0;
        
        // On-time payout rate (0-20 points)
        uint256 onTimeRate = (_metrics.onTimePayouts * 100) / _metrics.totalPayouts;
        return (onTimeRate * 20) / 100;
    }
    
    function getCreatorReputation(address _creator) external view returns (ReputationData memory) {
        return creatorReputations[_creator];
    }
    
    function isCreatorVerified(address _creator) external view returns (bool) {
        return creatorReputations[_creator].isVerified;
    }
}
