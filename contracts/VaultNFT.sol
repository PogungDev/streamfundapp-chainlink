// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title VaultNFT
 * @dev NFT contract representing investor shares in a CreatorVault
 * @notice Each investor gets an NFT representing their proportional claim to vault yields
 */
contract VaultNFT is ERC721, ERC721URIStorage, Ownable, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;
    using Strings for uint256;
    
    // Chainlink Functions configuration
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;
    
    // Creator and Vault data
    struct CreatorData {
        string channelId;
        string channelName;
        uint256 subscriberCount;
        uint256 viewCount;
        uint256 estimatedRPM;
        uint256 forecastedYield;
        uint256 createdAt;
        bool isActive;
    }
    
    struct VaultData {
        uint256 creatorId;
        uint256 totalInvested;
        uint256 currentYield;
        uint256 targetAmount;
        uint256 maturityDate;
        bool isMatured;
        string metadataURI;
    }
    
    // Storage mappings
    mapping(uint256 => CreatorData) public creators;
    mapping(uint256 => VaultData) public vaults;
    mapping(bytes32 => uint256) public requestToVaultId;
    
    // Counters
    uint256 private _vaultIdCounter;
    uint256 private _creatorIdCounter;
    
    // Events
    event VaultCreated(uint256 indexed vaultId, uint256 indexed creatorId, address indexed creator);
    event CreatorDataUpdated(uint256 indexed creatorId, uint256 rpm, uint256 forecastedYield);
    event ChainlinkRequestSent(bytes32 indexed requestId, uint256 indexed vaultId);
    event ChainlinkResponseReceived(bytes32 indexed requestId, uint256 rpm, uint256 forecast);
    
    // JavaScript source code for Chainlink Functions
    string private constant SOURCE_CODE = 
        "const channelId = args[0];"
        "const apiUrl = `https://api.streamfund.io/creator/${channelId}/stats`;"
        "const response = await Functions.makeHttpRequest({ url: apiUrl });"
        "if (response.error) throw new Error('API request failed');"
        "const data = response.data;"
        "const rpm = Math.floor(data.estimatedRPM || 0);"
        "const forecast = Math.floor(data.forecastedYield || 0);"
        "return Functions.encodeUint256(rpm * 1000000 + forecast);";

    constructor(
        address functionsRouter,
        bytes32 _donId,
        uint64 _subscriptionId
    ) 
        ERC721("StreamFund Vault NFT", "SFVAULT") 
        Ownable(msg.sender)
        FunctionsClient(functionsRouter)
    {
        donId = _donId;
        subscriptionId = _subscriptionId;
    }

    function createVault(
        string memory channelId,
        string memory channelName,
        uint256 targetAmount,
        uint256 maturityDays
    ) external returns (uint256) {
        // Create creator data
        uint256 creatorId = _creatorIdCounter++;
        creators[creatorId] = CreatorData({
            channelId: channelId,
            channelName: channelName,
            subscriberCount: 0,
            viewCount: 0,
            estimatedRPM: 0,
            forecastedYield: 0,
            createdAt: block.timestamp,
            isActive: true
        });
        
        // Create vault data
        uint256 vaultId = _vaultIdCounter++;
        vaults[vaultId] = VaultData({
            creatorId: creatorId,
            totalInvested: 0,
            currentYield: 0,
            targetAmount: targetAmount,
            maturityDate: block.timestamp + (maturityDays * 1 days),
            isMatured: false,
            metadataURI: ""
        });
        
        // Mint NFT to creator
        _safeMint(msg.sender, vaultId);
        
        // Request Chainlink Functions to fetch YouTube data
        _requestCreatorData(vaultId, channelId);
        
        emit VaultCreated(vaultId, creatorId, msg.sender);
        return vaultId;
    }
    
    function _requestCreatorData(uint256 vaultId, string memory channelId) internal {
        FunctionsRequest.Request memory req;
        req.initializeRequest(FunctionsRequest.Location.Inline, FunctionsRequest.CodeLanguage.JavaScript, SOURCE_CODE);
        
        string[] memory args = new string[](1);
        args[0] = channelId;
        req.setArgs(args);
        
        bytes32 requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
        requestToVaultId[requestId] = vaultId;
        
        emit ChainlinkRequestSent(requestId, vaultId);
    }
    
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        uint256 vaultId = requestToVaultId[requestId];
        require(vaultId < _vaultIdCounter, "Invalid vault ID");
        
        if (err.length > 0) {
            // Handle error - set default values
            return;
        }
        
        uint256 combinedData = abi.decode(response, (uint256));
        uint256 rpm = combinedData / 1000000;
        uint256 forecast = combinedData % 1000000;
        
        // Update creator data
        uint256 creatorId = vaults[vaultId].creatorId;
        creators[creatorId].estimatedRPM = rpm;
        creators[creatorId].forecastedYield = forecast;
        
        emit ChainlinkResponseReceived(requestId, rpm, forecast);
        emit CreatorDataUpdated(creatorId, rpm, forecast);
    }
    
    function updateVaultInvestment(uint256 vaultId, uint256 amount) external onlyOwner {
        require(vaultId < _vaultIdCounter, "Vault does not exist");
        vaults[vaultId].totalInvested += amount;
    }
    
    function updateVaultYield(uint256 vaultId, uint256 yield) external onlyOwner {
        require(vaultId < _vaultIdCounter, "Vault does not exist");
        vaults[vaultId].currentYield = yield;
    }
    
    function setVaultMatured(uint256 vaultId) external onlyOwner {
        require(vaultId < _vaultIdCounter, "Vault does not exist");
        vaults[vaultId].isMatured = true;
    }
    
    function setTokenURI(uint256 tokenId, string memory uri) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, uri);
        vaults[tokenId].metadataURI = uri;
    }
    
    // View functions
    function getVaultData(uint256 vaultId) external view returns (VaultData memory) {
        require(vaultId < _vaultIdCounter, "Vault does not exist");
        return vaults[vaultId];
    }
    
    function getCreatorData(uint256 creatorId) external view returns (CreatorData memory) {
        require(creatorId < _creatorIdCounter, "Creator does not exist");
        return creators[creatorId];
    }
    
    function totalVaults() external view returns (uint256) {
        return _vaultIdCounter;
    }
    
    function totalCreators() external view returns (uint256) {
        return _creatorIdCounter;
    }

    // Override functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 