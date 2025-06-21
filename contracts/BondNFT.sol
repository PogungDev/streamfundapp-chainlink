// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BondNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct BondMetadata {
        string creatorName;
        uint256 targetAPR;
        uint256 duration;
        uint256 maxFunding;
        uint256 riskLevel;
        uint256 mintTimestamp;
        bool isActive;
    }
    
    mapping(uint256 => BondMetadata) public bondMetadata;
    mapping(address => uint256[]) public creatorTokens;
    
    event BondMinted(address indexed creator, uint256 tokenId, uint256 targetAPR);
    event BondActivated(uint256 tokenId);
    
    constructor() ERC721("StreamFund Yield Bond", "SFYB") {}
    
    function mintBond(
        address _creator,
        string memory _creatorName,
        uint256 _targetAPR,
        uint256 _duration,
        uint256 _maxFunding,
        uint256 _riskLevel
    ) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(_creator, newTokenId);
        
        bondMetadata[newTokenId] = BondMetadata({
            creatorName: _creatorName,
            targetAPR: _targetAPR,
            duration: _duration,
            maxFunding: _maxFunding,
            riskLevel: _riskLevel,
            mintTimestamp: block.timestamp,
            isActive: true
        });
        
        creatorTokens[_creator].push(newTokenId);
        
        emit BondMinted(_creator, newTokenId, _targetAPR);
        return newTokenId;
    }
    
    function getBondMetadata(uint256 _tokenId) external view returns (BondMetadata memory) {
        require(_exists(_tokenId), "Token does not exist");
        return bondMetadata[_tokenId];
    }
    
    function getCreatorTokens(address _creator) external view returns (uint256[] memory) {
        return creatorTokens[_creator];
    }
}
