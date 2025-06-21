// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title VaultNFT
 * @dev NFT contract representing investor shares in a CreatorVault
 * @notice Each investor gets an NFT representing their proportional claim to vault yields
 */
contract VaultNFT is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    // Vault contract address
    address public immutable vault;
    
    // NFT metadata structure
    struct TokenMetadata {
        uint256 sharesOwned;
        string channelName;
        string channelId;
        uint256 mintedAt;
        uint256 lastUpdated;
    }
    
    mapping(uint256 => TokenMetadata) public tokenMetadata;
    
    // Events
    event InvestorNFTMinted(address indexed investor, uint256 indexed tokenId, uint256 shares);
    event TokenSharesUpdated(uint256 indexed tokenId, uint256 newShares);
    
    modifier onlyVault() {
        require(msg.sender == vault, "Only vault can call");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        address _vault
    ) ERC721(_name, _symbol) {
        vault = _vault;
    }
    
    /**
     * @dev Mints NFT for investor representing their vault position
     * @param _investor Investor address
     * @param _shares Number of shares represented
     * @param _channelName YouTube channel name
     * @param _channelId YouTube channel ID
     * @return tokenId Minted token ID
     */
    function mintInvestorNFT(
        address _investor,
        uint256 _shares,
        string memory _channelName,
        string memory _channelId
    ) external onlyVault returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _mint(_investor, tokenId);
        
        // Store metadata
        tokenMetadata[tokenId] = TokenMetadata({
            sharesOwned: _shares,
            channelName: _channelName,
            channelId: _channelId,
            mintedAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        // Generate and set token URI
        string memory tokenURI = _generateTokenURI(tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit InvestorNFTMinted(_investor, tokenId, _shares);
        
        return tokenId;
    }
    
    /**
     * @dev Updates the number of shares represented by an NFT
     * @param _tokenId Token ID to update
     * @param _newShares New number of shares
     */
    function updateTokenShares(uint256 _tokenId, uint256 _newShares) external onlyVault {
        require(_exists(_tokenId), "Token does not exist");
        
        tokenMetadata[_tokenId].sharesOwned = _newShares;
        tokenMetadata[_tokenId].lastUpdated = block.timestamp;
        
        // Update token URI with new data
        string memory newTokenURI = _generateTokenURI(_tokenId);
        _setTokenURI(_tokenId, newTokenURI);
        
        emit TokenSharesUpdated(_tokenId, _newShares);
    }
    
    /**
     * @dev Generates dynamic token URI with metadata
     * @param _tokenId Token ID
     * @return Base64 encoded JSON metadata
     */
    function _generateTokenURI(uint256 _tokenId) internal view returns (string memory) {
        TokenMetadata memory metadata = tokenMetadata[_tokenId];
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{',
            '"name": "StreamFund Investor NFT #', _tokenId.toString(), '",',
            '"description": "NFT representing investor position in ', metadata.channelName, ' vault",',
            '"image": "', _generateImageURI(_tokenId), '",',
            '"external_url": "https://streamfundapp.vercel.app/vault/', AddressStrings.toHexString(vault), '",',
            '"attributes": [',
            '{',
            '"trait_type": "Channel Name",',
            '"value": "', metadata.channelName, '"',
            '},',
            '{',
            '"trait_type": "Channel ID",',
            '"value": "', metadata.channelId, '"',
            '},',
            '{',
            '"trait_type": "Shares Owned",',
            '"value": ', metadata.sharesOwned.toString(),
            '},',
            '{',
            '"trait_type": "Minted At",',
            '"value": ', metadata.mintedAt.toString(),
            '},',
            '{',
            '"trait_type": "Last Updated",',
            '"value": ', metadata.lastUpdated.toString(),
            '},',
            '{',
            '"trait_type": "Vault Address",',
            '"value": "', vault.toHexString(), '"',
            '}',
            ']',
            '}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }
    
    /**
     * @dev Generates dynamic SVG image for the NFT
     * @param _tokenId Token ID
     * @return Base64 encoded SVG
     */
    function _generateImageURI(uint256 _tokenId) internal view returns (string memory) {
        TokenMetadata memory metadata = tokenMetadata[_tokenId];
        
        // Create SVG image
        string memory svg = string(abi.encodePacked(
            '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />',
            '</linearGradient>',
            '</defs>',
            '<rect width="400" height="400" fill="url(#bg)" />',
            '<text x="20" y="40" font-family="Arial, sans-serif" font-size="18" fill="white" font-weight="bold">StreamFund Investor NFT</text>',
            '<text x="20" y="80" font-family="Arial, sans-serif" font-size="14" fill="white">Channel: ', _truncateString(metadata.channelName, 25), '</text>',
            '<text x="20" y="110" font-family="Arial, sans-serif" font-size="14" fill="white">Shares: ', metadata.sharesOwned.toString(), '</text>',
            '<text x="20" y="140" font-family="Arial, sans-serif" font-size="12" fill="white">Token ID: #', _tokenId.toString(), '</text>',
            '<text x="20" y="170" font-family="Arial, sans-serif" font-size="12" fill="white">Vault: ', _truncateAddress(vault), '</text>',
            '<rect x="20" y="200" width="360" height="2" fill="white" opacity="0.3" />',
            '<text x="20" y="240" font-family="Arial, sans-serif" font-size="12" fill="white">This NFT represents your proportional</text>',
            '<text x="20" y="260" font-family="Arial, sans-serif" font-size="12" fill="white">claim to yield from creator AdSense</text>',
            '<text x="20" y="280" font-family="Arial, sans-serif" font-size="12" fill="white">revenue. Hold to earn yield.</text>',
            '<text x="20" y="340" font-family="Arial, sans-serif" font-size="10" fill="white" opacity="0.7">Powered by Chainlink • Cross-chain yield</text>',
            '<text x="20" y="360" font-family="Arial, sans-serif" font-size="10" fill="white" opacity="0.7">streamfundapp.vercel.app</text>',
            '</svg>'
        ));
        
        return string(abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(svg))
        ));
    }
    
    /**
     * @dev Helper function to truncate long strings
     * @param _str String to truncate
     * @param _maxLength Maximum length
     * @return Truncated string
     */
    function _truncateString(string memory _str, uint256 _maxLength) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        if (strBytes.length <= _maxLength) {
            return _str;
        }
        
        bytes memory truncated = new bytes(_maxLength - 3);
        for (uint256 i = 0; i < _maxLength - 3; i++) {
            truncated[i] = strBytes[i];
        }
        
        return string(abi.encodePacked(truncated, "..."));
    }
    
    /**
     * @dev Helper function to truncate address for display
     * @param _addr Address to truncate
     * @return Truncated address string
     */
    function _truncateAddress(address _addr) internal pure returns (string memory) {
        string memory addr = _addr.toHexString();
        return string(abi.encodePacked(
            substring(addr, 0, 6),
            "...",
            substring(addr, bytes(addr).length - 4, bytes(addr).length)
        ));
    }
    
    /**
     * @dev Helper function to get substring
     * @param _str Source string
     * @param _start Start index
     * @param _end End index
     * @return Substring
     */
    function substring(string memory _str, uint256 _start, uint256 _end) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        bytes memory result = new bytes(_end - _start);
        
        for (uint256 i = _start; i < _end; i++) {
            result[i - _start] = strBytes[i];
        }
        
        return string(result);
    }
    
    /**
     * @dev Gets token metadata
     * @param _tokenId Token ID
     * @return TokenMetadata struct
     */
    function getTokenMetadata(uint256 _tokenId) external view returns (TokenMetadata memory) {
        require(_exists(_tokenId), "Token does not exist");
        return tokenMetadata[_tokenId];
    }
    
    /**
     * @dev Gets total number of minted tokens
     * @return Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

// Extension to convert address to hex string
library AddressStrings {
    function toHexString(address addr) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(addr)), 20);
    }
} 