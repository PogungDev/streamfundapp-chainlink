// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract InvestorBadge is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    enum BadgeType {
        BRONZE,    // $1,000+ invested
        SILVER,    // $5,000+ invested
        GOLD,      // $10,000+ invested
        PLATINUM,  // $25,000+ invested
        DIAMOND    // $50,000+ invested
    }
    
    struct Badge {
        BadgeType badgeType;
        uint256 totalInvested;
        uint256 vaultsCount;
        uint256 mintTimestamp;
        string achievement;
    }
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256) public investorBadges;
    mapping(address => uint256) public totalInvestments;
    mapping(address => uint256) public vaultCounts;
    
    uint256[] public badgeThresholds = [1000, 5000, 10000, 25000, 50000]; // USDC amounts
    
    event BadgeMinted(address indexed investor, BadgeType badgeType, uint256 tokenId);
    event BadgeUpgraded(address indexed investor, BadgeType oldType, BadgeType newType);
    
    constructor() ERC721("StreamFund Investor Badge", "SFIB") {}
    
    function updateInvestorStats(
        address _investor,
        uint256 _investmentAmount,
        uint256 _vaultId
    ) external onlyOwner {
        totalInvestments[_investor] += _investmentAmount;
        vaultCounts[_investor]++;
        
        BadgeType newBadgeType = calculateBadgeType(totalInvestments[_investor]);
        
        if (investorBadges[_investor] == 0) {
            // Mint first badge
            _mintBadge(_investor, newBadgeType);
        } else {
            // Check for upgrade
            uint256 currentTokenId = investorBadges[_investor];
            BadgeType currentType = badges[currentTokenId].badgeType;
            
            if (newBadgeType > currentType) {
                _upgradeBadge(_investor, currentType, newBadgeType);
            }
        }
    }
    
    function _mintBadge(address _investor, BadgeType _badgeType) internal {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(_investor, newTokenId);
        
        badges[newTokenId] = Badge({
            badgeType: _badgeType,
            totalInvested: totalInvestments[_investor],
            vaultsCount: vaultCounts[_investor],
            mintTimestamp: block.timestamp,
            achievement: getBadgeAchievement(_badgeType)
        });
        
        investorBadges[_investor] = newTokenId;
        
        emit BadgeMinted(_investor, _badgeType, newTokenId);
    }
    
    function _upgradeBadge(address _investor, BadgeType _oldType, BadgeType _newType) internal {
        uint256 tokenId = investorBadges[_investor];
        
        badges[tokenId].badgeType = _newType;
        badges[tokenId].totalInvested = totalInvestments[_investor];
        badges[tokenId].vaultsCount = vaultCounts[_investor];
        badges[tokenId].achievement = getBadgeAchievement(_newType);
        
        emit BadgeUpgraded(_investor, _oldType, _newType);
    }
    
    function calculateBadgeType(uint256 _totalInvested) public view returns (BadgeType) {
        if (_totalInvested >= badgeThresholds[4]) return BadgeType.DIAMOND;
        if (_totalInvested >= badgeThresholds[3]) return BadgeType.PLATINUM;
        if (_totalInvested >= badgeThresholds[2]) return BadgeType.GOLD;
        if (_totalInvested >= badgeThresholds[1]) return BadgeType.SILVER;
        if (_totalInvested >= badgeThresholds[0]) return BadgeType.BRONZE;
        return BadgeType.BRONZE; // Default
    }
    
    function getBadgeAchievement(BadgeType _badgeType) internal pure returns (string memory) {
        if (_badgeType == BadgeType.DIAMOND) return "Diamond Investor - Elite Yield Farmer";
        if (_badgeType == BadgeType.PLATINUM) return "Platinum Investor - Yield Master";
        if (_badgeType == BadgeType.GOLD) return "Gold Investor - Yield Expert";
        if (_badgeType == BadgeType.SILVER) return "Silver Investor - Yield Enthusiast";
        return "Bronze Investor - Yield Starter";
    }
    
    function getInvestorBadge(address _investor) external view returns (Badge memory) {
        uint256 tokenId = investorBadges[_investor];
        require(tokenId != 0, "No badge found");
        return badges[tokenId];
    }
}
