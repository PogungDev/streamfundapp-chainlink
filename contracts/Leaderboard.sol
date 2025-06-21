// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Leaderboard is Ownable {
    struct VaultRanking {
        uint256 vaultId;
        address creator;
        string vaultName;
        uint256 totalFunding;
        uint256 currentAPR;
        uint256 totalInvestors;
        uint256 performanceScore;
        uint256 rank;
        uint256 lastUpdated;
    }
    
    struct CreatorRanking {
        address creator;
        string creatorName;
        uint256 totalVaults;
        uint256 totalFunding;
        uint256 avgAPR;
        uint256 successRate;
        uint256 reputationScore;
        uint256 rank;
        uint256 lastUpdated;
    }
    
    struct InvestorRanking {
        address investor;
        uint256 totalInvested;
        uint256 totalYieldEarned;
        uint256 portfolioCount;
        uint256 avgROI;
        uint256 investorLevel;
        uint256 rank;
        uint256 lastUpdated;
    }
    
    // Vault leaderboards
    mapping(uint256 => VaultRanking) public vaultRankings;
    uint256[] public topVaultsByFunding;
    uint256[] public topVaultsByAPR;
    uint256[] public topVaultsByInvestors;
    
    // Creator leaderboards
    mapping(address => CreatorRanking) public creatorRankings;
    address[] public topCreatorsByFunding;
    address[] public topCreatorsByReputation;
    address[] public topCreatorsBySuccess;
    
    // Investor leaderboards
    mapping(address => InvestorRanking) public investorRankings;
    address[] public topInvestorsByVolume;
    address[] public topInvestorsByYield;
    address[] public topInvestorsByROI;
    
    uint256 public constant LEADERBOARD_SIZE = 100;
    uint256 public lastGlobalUpdate;
    
    event LeaderboardUpdated(string leaderboardType, uint256 timestamp);
    event VaultRankChanged(uint256 indexed vaultId, uint256 oldRank, uint256 newRank);
    event CreatorRankChanged(address indexed creator, uint256 oldRank, uint256 newRank);
    
    function updateVaultRanking(
        uint256 _vaultId,
        address _creator,
        string memory _vaultName,
        uint256 _totalFunding,
        uint256 _currentAPR,
        uint256 _totalInvestors
    ) external onlyOwner {
        uint256 performanceScore = calculateVaultPerformanceScore(_totalFunding, _currentAPR, _totalInvestors);
        
        uint256 oldRank = vaultRankings[_vaultId].rank;
        
        vaultRankings[_vaultId] = VaultRanking({
            vaultId: _vaultId,
            creator: _creator,
            vaultName: _vaultName,
            totalFunding: _totalFunding,
            currentAPR: _currentAPR,
            totalInvestors: _totalInvestors,
            performanceScore: performanceScore,
            rank: 0, // Will be calculated in sorting
            lastUpdated: block.timestamp
        });
        
        _updateVaultLeaderboards(_vaultId);
        
        uint256 newRank = vaultRankings[_vaultId].rank;
        if (oldRank != newRank) {
            emit VaultRankChanged(_vaultId, oldRank, newRank);
        }
    }
    
    function updateCreatorRanking(
        address _creator,
        string memory _creatorName,
        uint256 _totalVaults,
        uint256 _totalFunding,
        uint256 _avgAPR,
        uint256 _successRate,
        uint256 _reputationScore
    ) external onlyOwner {
        uint256 oldRank = creatorRankings[_creator].rank;
        
        creatorRankings[_creator] = CreatorRanking({
            creator: _creator,
            creatorName: _creatorName,
            totalVaults: _totalVaults,
            totalFunding: _totalFunding,
            avgAPR: _avgAPR,
            successRate: _successRate,
            reputationScore: _reputationScore,
            rank: 0, // Will be calculated in sorting
            lastUpdated: block.timestamp
        });
        
        _updateCreatorLeaderboards(_creator);
        
        uint256 newRank = creatorRankings[_creator].rank;
        if (oldRank != newRank) {
            emit CreatorRankChanged(_creator, oldRank, newRank);
        }
    }
    
    function updateInvestorRanking(
        address _investor,
        uint256 _totalInvested,
        uint256 _totalYieldEarned,
        uint256 _portfolioCount,
        uint256 _avgROI,
        uint256 _investorLevel
    ) external onlyOwner {
        investorRankings[_investor] = InvestorRanking({
            investor: _investor,
            totalInvested: _totalInvested,
            totalYieldEarned: _totalYieldEarned,
            portfolioCount: _portfolioCount,
            avgROI: _avgROI,
            investorLevel: _investorLevel,
            rank: 0, // Will be calculated in sorting
            lastUpdated: block.timestamp
        });
        
        _updateInvestorLeaderboards(_investor);
    }
    
    function calculateVaultPerformanceScore(
        uint256 _totalFunding,
        uint256 _currentAPR,
        uint256 _totalInvestors
    ) internal pure returns (uint256) {
        // Weighted performance score
        uint256 fundingScore = _totalFunding / 1000; // 1 point per $1000
        uint256 aprScore = _currentAPR * 10; // 10 points per 1% APR
        uint256 investorScore = _totalInvestors * 50; // 50 points per investor
        
        return (fundingScore * 40 + aprScore * 35 + investorScore * 25) / 100;
    }
    
    function _updateVaultLeaderboards(uint256 _vaultId) internal {
        // Update funding leaderboard
        _insertIntoVaultLeaderboard(topVaultsByFunding, _vaultId, "funding");
        
        // Update APR leaderboard
        _insertIntoVaultLeaderboard(topVaultsByAPR, _vaultId, "apr");
        
        // Update investors leaderboard
        _insertIntoVaultLeaderboard(topVaultsByInvestors, _vaultId, "investors");
    }
    
    function _insertIntoVaultLeaderboard(
        uint256[] storage leaderboard,
        uint256 _vaultId,
        string memory _type
    ) internal {
        // Remove if already exists
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i] == _vaultId) {
                // Shift elements left
                for (uint256 j = i; j < leaderboard.length - 1; j++) {
                    leaderboard[j] = leaderboard[j + 1];
                }
                leaderboard.pop();
                break;
            }
        }
        
        // Find insertion position
        uint256 insertPos = leaderboard.length;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (_shouldInsertBefore(_vaultId, leaderboard[i], _type)) {
                insertPos = i;
                break;
            }
        }
        
        // Insert at position (if within limit)
        if (insertPos < LEADERBOARD_SIZE) {
            leaderboard.push(0); // Expand array
            
            // Shift elements right
            for (uint256 i = leaderboard.length - 1; i > insertPos; i--) {
                leaderboard[i] = leaderboard[i - 1];
            }
            
            leaderboard[insertPos] = _vaultId;
            
            // Trim if over limit
            if (leaderboard.length > LEADERBOARD_SIZE) {
                leaderboard.pop();
            }
            
            // Update rank
            vaultRankings[_vaultId].rank = insertPos + 1;
        }
    }
    
    function _shouldInsertBefore(uint256 _vaultId1, uint256 _vaultId2, string memory _type) internal view returns (bool) {
        VaultRanking memory vault1 = vaultRankings[_vaultId1];
        VaultRanking memory vault2 = vaultRankings[_vaultId2];
        
        if (keccak256(bytes(_type)) == keccak256(bytes("funding"))) {
            return vault1.totalFunding > vault2.totalFunding;
        } else if (keccak256(bytes(_type)) == keccak256(bytes("apr"))) {
            return vault1.currentAPR > vault2.currentAPR;
        } else if (keccak256(bytes(_type)) == keccak256(bytes("investors"))) {
            return vault1.totalInvestors > vault2.totalInvestors;
        }
        
        return vault1.performanceScore > vault2.performanceScore;
    }
    
    function _updateCreatorLeaderboards(address _creator) internal {
        // Similar implementation for creator leaderboards
        // Simplified for brevity
    }
    
    function _updateInvestorLeaderboards(address _investor) internal {
        // Similar implementation for investor leaderboards
        // Simplified for brevity
    }
    
    function getTopVaultsByFunding(uint256 _limit) external view returns (uint256[] memory) {
        uint256 limit = _limit > topVaultsByFunding.length ? topVaultsByFunding.length : _limit;
        uint256[] memory result = new uint256[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            result[i] = topVaultsByFunding[i];
        }
        
        return result;
    }
    
    function getTopCreatorsByFunding(uint256 _limit) external view returns (address[] memory) {
        uint256 limit = _limit > topCreatorsByFunding.length ? topCreatorsByFunding.length : _limit;
        address[] memory result = new address[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            result[i] = topCreatorsByFunding[i];
        }
        
        return result;
    }
    
    function getVaultRank(uint256 _vaultId) external view returns (uint256) {
        return vaultRankings[_vaultId].rank;
    }
    
    function getCreatorRank(address _creator) external view returns (uint256) {
        return creatorRankings[_creator].rank;
    }
}
