// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CreatorSBT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct CreatorProfile {
        string channelId;
        string creatorName;
        string category;
        uint256 verificationLevel;
        uint256 reputationScore;
        uint256 totalVaults;
        uint256 totalFunding;
        uint256 mintTimestamp;
        bool isVerified;
    }
    
    mapping(uint256 => CreatorProfile) public creatorProfiles;
    mapping(address => uint256) public creatorTokens;
    mapping(string => address) public channelToCreator;
    
    event SBTMinted(address indexed creator, uint256 tokenId, string channelId);
    event CreatorVerified(address indexed creator, uint256 verificationLevel);
    event ReputationUpdated(address indexed creator, uint256 newScore);
    
    constructor() ERC721("StreamFund Creator SBT", "SFCSBT") {}
    
    function mintCreatorSBT(
        address _creator,
        string memory _channelId,
        string memory _creatorName,
        string memory _category
    ) external onlyOwner returns (uint256) {
        require(creatorTokens[_creator] == 0, "Creator already has SBT");
        require(channelToCreator[_channelId] == address(0), "Channel already registered");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(_creator, newTokenId);
        
        creatorProfiles[newTokenId] = CreatorProfile({
            channelId: _channelId,
            creatorName: _creatorName,
            category: _category,
            verificationLevel: 1, // Basic verification
            reputationScore: 50,  // Starting reputation
            totalVaults: 0,
            totalFunding: 0,
            mintTimestamp: block.timestamp,
            isVerified: false
        });
        
        creatorTokens[_creator] = newTokenId;
        channelToCreator[_channelId] = _creator;
        
        emit SBTMinted(_creator, newTokenId, _channelId);
        return newTokenId;
    }
    
    function verifyCreator(address _creator, uint256 _verificationLevel) external onlyOwner {
        uint256 tokenId = creatorTokens[_creator];
        require(tokenId != 0, "Creator not found");
        
        creatorProfiles[tokenId].verificationLevel = _verificationLevel;
        creatorProfiles[tokenId].isVerified = true;
        
        emit CreatorVerified(_creator, _verificationLevel);
    }
    
    function updateCreatorStats(
        address _creator,
        uint256 _vaultCount,
        uint256 _totalFunding
    ) external onlyOwner {
        uint256 tokenId = creatorTokens[_creator];
        require(tokenId != 0, "Creator not found");
        
        creatorProfiles[tokenId].totalVaults = _vaultCount;
        creatorProfiles[tokenId].totalFunding = _totalFunding;
        
        // Update reputation based on performance
        uint256 newReputation = calculateReputation(_vaultCount, _totalFunding);
        creatorProfiles[tokenId].reputationScore = newReputation;
        
        emit ReputationUpdated(_creator, newReputation);
    }
    
    function calculateReputation(uint256 _vaultCount, uint256 _totalFunding) internal pure returns (uint256) {
        uint256 vaultScore = _vaultCount * 10; // 10 points per vault
        uint256 fundingScore = _totalFunding / 1000; // 1 point per $1000 funded
        
        uint256 totalScore = 50 + vaultScore + fundingScore; // Base 50 + performance
        return totalScore > 100 ? 100 : totalScore; // Cap at 100
    }
    
    function getCreatorProfile(address _creator) external view returns (CreatorProfile memory) {
        uint256 tokenId = creatorTokens[_creator];
        require(tokenId != 0, "Creator not found");
        return creatorProfiles[tokenId];
    }
    
    function getCreatorByChannel(string memory _channelId) external view returns (address) {
        return channelToCreator[_channelId];
    }
    
    // Override transfer functions to make it soulbound
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "Soulbound: Transfer not allowed");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
