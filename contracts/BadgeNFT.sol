// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract BadgeNFT is ERC721, ERC721URIStorage, Ownable, AutomationCompatibleInterface {
    using Strings for uint256;
    
    // Badge types
    enum BadgeType {
        EARLY_INVESTOR,    // First 10 investors in a vault
        HIGH_ROLLER,       // Investment > 1000 USDC
        YIELD_MASTER,      // Earned > 100 USDC in yield
        VAULT_PIONEER,     // Invested in 5+ vaults
        DIAMOND_HANDS,     // Held investment for 6+ months
        YIELD_HUNTER,      // Earned yield in 3+ vaults
        COMMUNITY_BUILDER, // Referred 5+ investors
        MILESTONE_ACHIEVER // Vault reached funding milestone
    }
    
    struct Badge {
        BadgeType badgeType;
        uint256 vaultId;
        address recipient;
        uint256 mintedAt;
        string metadataURI;
        uint256 achievementValue; // e.g., investment amount, yield earned, etc.
    }
    
    struct InvestorStats {
        uint256 totalInvested;
        uint256 totalYieldEarned;
        uint256 vaultsInvested;
        uint256 referrals;
        uint256 firstInvestmentDate;
        bool[] badgesEarned; // Array of 8 booleans for each BadgeType
    }
    
    // Storage
    mapping(uint256 => Badge) public badges;
    mapping(address => InvestorStats) public investorStats;
    mapping(address => uint256[]) public investorBadges;
    mapping(uint256 => bool) public vaultMilestones; // vaultId => milestone reached
    
    // Chainlink Automation
    mapping(address => uint256) public lastCheckTimestamp;
    uint256 public checkInterval = 1 days;
    
    uint256 private _badgeIdCounter;
    
    // Badge criteria
    uint256 public constant HIGH_ROLLER_THRESHOLD = 1000 * 10**6; // 1000 USDC
    uint256 public constant YIELD_MASTER_THRESHOLD = 100 * 10**6; // 100 USDC
    uint256 public constant VAULT_PIONEER_THRESHOLD = 5;
    uint256 public constant DIAMOND_HANDS_PERIOD = 180 days; // 6 months
    uint256 public constant YIELD_HUNTER_THRESHOLD = 3;
    uint256 public constant COMMUNITY_BUILDER_THRESHOLD = 5;
    
    // Events
    event BadgeMinted(
        address indexed recipient, 
        uint256 indexed badgeId, 
        BadgeType badgeType, 
        uint256 vaultId
    );
    event InvestorStatsUpdated(address indexed investor, uint256 totalInvested, uint256 totalYield);
    event MilestoneReached(uint256 indexed vaultId, uint256 targetAmount);
    
    constructor() ERC721("StreamFund Badge NFT", "SFBADGE") Ownable(msg.sender) {
        // Initialize badge tracking for each type
    }
    
    function mintBadge(
        address recipient, 
        BadgeType badgeType, 
        uint256 vaultId, 
        uint256 achievementValue,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        // Check if user already has this badge type
        require(!investorStats[recipient].badgesEarned[uint256(badgeType)], "Badge already earned");
        
        uint256 badgeId = _badgeIdCounter++;
        
        badges[badgeId] = Badge({
            badgeType: badgeType,
            vaultId: vaultId,
            recipient: recipient,
            mintedAt: block.timestamp,
            metadataURI: metadataURI,
            achievementValue: achievementValue
        });
        
        // Mark badge as earned
        investorStats[recipient].badgesEarned[uint256(badgeType)] = true;
        investorBadges[recipient].push(badgeId);
        
        // Mint NFT
        _safeMint(recipient, badgeId);
        _setTokenURI(badgeId, metadataURI);
        
        emit BadgeMinted(recipient, badgeId, badgeType, vaultId);
        return badgeId;
    }
    
    function updateInvestorStats(
        address investor,
        uint256 investmentAmount,
        uint256 yieldEarned,
        uint256 vaultId,
        bool isNewVault
    ) external onlyOwner {
        InvestorStats storage stats = investorStats[investor];
        
        // Initialize if first investment
        if (stats.firstInvestmentDate == 0) {
            stats.firstInvestmentDate = block.timestamp;
            stats.badgesEarned = new bool[](8); // Initialize array for 8 badge types
        }
        
        // Update stats
        stats.totalInvested += investmentAmount;
        stats.totalYieldEarned += yieldEarned;
        
        if (isNewVault) {
            stats.vaultsInvested++;
        }
        
        // Check for badge eligibility
        _checkBadgeEligibility(investor, vaultId);
        
        emit InvestorStatsUpdated(investor, stats.totalInvested, stats.totalYieldEarned);
    }
    
    function _checkBadgeEligibility(address investor, uint256 vaultId) internal {
        InvestorStats storage stats = investorStats[investor];
        
        // HIGH_ROLLER badge
        if (stats.totalInvested >= HIGH_ROLLER_THRESHOLD && 
            !stats.badgesEarned[uint256(BadgeType.HIGH_ROLLER)]) {
            _mintAutoBadge(investor, BadgeType.HIGH_ROLLER, vaultId, stats.totalInvested);
        }
        
        // YIELD_MASTER badge
        if (stats.totalYieldEarned >= YIELD_MASTER_THRESHOLD && 
            !stats.badgesEarned[uint256(BadgeType.YIELD_MASTER)]) {
            _mintAutoBadge(investor, BadgeType.YIELD_MASTER, vaultId, stats.totalYieldEarned);
        }
        
        // VAULT_PIONEER badge
        if (stats.vaultsInvested >= VAULT_PIONEER_THRESHOLD && 
            !stats.badgesEarned[uint256(BadgeType.VAULT_PIONEER)]) {
            _mintAutoBadge(investor, BadgeType.VAULT_PIONEER, vaultId, stats.vaultsInvested);
        }
        
        // DIAMOND_HANDS badge
        if (block.timestamp >= stats.firstInvestmentDate + DIAMOND_HANDS_PERIOD && 
            !stats.badgesEarned[uint256(BadgeType.DIAMOND_HANDS)]) {
            _mintAutoBadge(investor, BadgeType.DIAMOND_HANDS, vaultId, 
                block.timestamp - stats.firstInvestmentDate);
        }
    }
    
    function _mintAutoBadge(
        address recipient, 
        BadgeType badgeType, 
        uint256 vaultId, 
        uint256 achievementValue
    ) internal {
        string memory metadataURI = _generateBadgeMetadata(badgeType, achievementValue);
        
        uint256 badgeId = _badgeIdCounter++;
        
        badges[badgeId] = Badge({
            badgeType: badgeType,
            vaultId: vaultId,
            recipient: recipient,
            mintedAt: block.timestamp,
            metadataURI: metadataURI,
            achievementValue: achievementValue
        });
        
        investorStats[recipient].badgesEarned[uint256(badgeType)] = true;
        investorBadges[recipient].push(badgeId);
        
        _safeMint(recipient, badgeId);
        _setTokenURI(badgeId, metadataURI);
        
        emit BadgeMinted(recipient, badgeId, badgeType, vaultId);
    }
    
    function _generateBadgeMetadata(BadgeType badgeType, uint256 achievementValue) 
        internal 
        pure 
        returns (string memory) 
    {
        // In production, this would generate proper JSON metadata
        if (badgeType == BadgeType.HIGH_ROLLER) {
            return "https://api.streamfund.io/metadata/badge/high-roller";
        } else if (badgeType == BadgeType.YIELD_MASTER) {
            return "https://api.streamfund.io/metadata/badge/yield-master";
        } else if (badgeType == BadgeType.VAULT_PIONEER) {
            return "https://api.streamfund.io/metadata/badge/vault-pioneer";
        } else if (badgeType == BadgeType.DIAMOND_HANDS) {
            return "https://api.streamfund.io/metadata/badge/diamond-hands";
        }
        return "https://api.streamfund.io/metadata/badge/default";
    }
    
    // Chainlink Automation functions
    function checkUpkeep(bytes calldata) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        // Check if any investors need badge checking
        // This is simplified - in production would maintain a list of addresses to check
        upkeepNeeded = block.timestamp > lastCheckTimestamp[address(this)] + checkInterval;
        performData = "";
    }
    
    function performUpkeep(bytes calldata) external override {
        // Update timestamp
        lastCheckTimestamp[address(this)] = block.timestamp;
        
        // In production, would iterate through investors and check eligibility
        // This is a placeholder for the automation logic
    }
    
    // View functions
    function getBadge(uint256 badgeId) external view returns (Badge memory) {
        require(_ownerOf(badgeId) != address(0), "Badge does not exist");
        return badges[badgeId];
    }
    
    function getInvestorBadges(address investor) external view returns (uint256[] memory) {
        return investorBadges[investor];
    }
    
    function getInvestorStats(address investor) external view returns (InvestorStats memory) {
        return investorStats[investor];
    }
    
    function hasBadgeType(address investor, BadgeType badgeType) external view returns (bool) {
        return investorStats[investor].badgesEarned[uint256(badgeType)];
    }
    
    function totalBadges() external view returns (uint256) {
        return _badgeIdCounter;
    }
    
    // Override functions
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
} 