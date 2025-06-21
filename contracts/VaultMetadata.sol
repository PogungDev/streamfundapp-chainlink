// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultMetadata is Ownable {
    struct VaultInfo {
        uint256 vaultId;
        string name;
        string description;
        string category;
        string[] tags;
        string imageUrl;
        string creatorName;
        string channelUrl;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct VaultStats {
        uint256 totalInvestors;
        uint256 totalFunding;
        uint256 currentAPR;
        uint256 totalPayouts;
        uint256 successRate;
        uint256 avgInvestment;
        uint256 maturityDate;
        bool isActive;
    }
    
    struct VaultSocial {
        uint256 likes;
        uint256 shares;
        uint256 comments;
        uint256 views;
        string[] socialLinks;
        uint256 communityScore;
    }
    
    mapping(uint256 => VaultInfo) public vaultInfo;
    mapping(uint256 => VaultStats) public vaultStats;
    mapping(uint256 => VaultSocial) public vaultSocial;
    mapping(string => uint256[]) public categoryVaults;
    mapping(address => uint256[]) public creatorVaults;
    
    event VaultMetadataUpdated(uint256 indexed vaultId, string name);
    event VaultStatsUpdated(uint256 indexed vaultId, uint256 totalFunding, uint256 currentAPR);
    event VaultSocialUpdated(uint256 indexed vaultId, uint256 likes, uint256 views);
    
    function setVaultMetadata(
        uint256 _vaultId,
        string memory _name,
        string memory _description,
        string memory _category,
        string[] memory _tags,
        string memory _imageUrl,
        string memory _creatorName,
        string memory _channelUrl,
        address _creator
    ) external onlyOwner {
        vaultInfo[_vaultId] = VaultInfo({
            vaultId: _vaultId,
            name: _name,
            description: _description,
            category: _category,
            tags: _tags,
            imageUrl: _imageUrl,
            creatorName: _creatorName,
            channelUrl: _channelUrl,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        categoryVaults[_category].push(_vaultId);
        creatorVaults[_creator].push(_vaultId);
        
        emit VaultMetadataUpdated(_vaultId, _name);
    }
    
    function updateVaultStats(
        uint256 _vaultId,
        uint256 _totalInvestors,
        uint256 _totalFunding,
        uint256 _currentAPR,
        uint256 _totalPayouts,
        uint256 _successRate,
        uint256 _avgInvestment,
        uint256 _maturityDate,
        bool _isActive
    ) external onlyOwner {
        vaultStats[_vaultId] = VaultStats({
            totalInvestors: _totalInvestors,
            totalFunding: _totalFunding,
            currentAPR: _currentAPR,
            totalPayouts: _totalPayouts,
            successRate: _successRate,
            avgInvestment: _avgInvestment,
            maturityDate: _maturityDate,
            isActive: _isActive
        });
        
        emit VaultStatsUpdated(_vaultId, _totalFunding, _currentAPR);
    }
    
    function updateVaultSocial(
        uint256 _vaultId,
        uint256 _likes,
        uint256 _shares,
        uint256 _comments,
        uint256 _views,
        string[] memory _socialLinks,
        uint256 _communityScore
    ) external onlyOwner {
        vaultSocial[_vaultId] = VaultSocial({
            likes: _likes,
            shares: _shares,
            comments: _comments,
            views: _views,
            socialLinks: _socialLinks,
            communityScore: _communityScore
        });
        
        emit VaultSocialUpdated(_vaultId, _likes, _views);
    }
    
    function getVaultMetadata(uint256 _vaultId) external view returns (
        VaultInfo memory info,
        VaultStats memory stats,
        VaultSocial memory social
    ) {
        return (vaultInfo[_vaultId], vaultStats[_vaultId], vaultSocial[_vaultId]);
    }
    
    function getVaultsByCategory(string memory _category) external view returns (uint256[] memory) {
        return categoryVaults[_category];
    }
    
    function getCreatorVaults(address _creator) external view returns (uint256[] memory) {
        return creatorVaults[_creator];
    }
    
    function updateVaultDescription(uint256 _vaultId, string memory _newDescription) external onlyOwner {
        vaultInfo[_vaultId].description = _newDescription;
        vaultInfo[_vaultId].updatedAt = block.timestamp;
        
        emit VaultMetadataUpdated(_vaultId, vaultInfo[_vaultId].name);
    }
    
    function addVaultTag(uint256 _vaultId, string memory _tag) external onlyOwner {
        vaultInfo[_vaultId].tags.push(_tag);
        vaultInfo[_vaultId].updatedAt = block.timestamp;
    }
}
