// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AIIntentRouter is Ownable {
    struct Intent {
        string query;
        uint256 minAPR;
        uint256 maxRisk;
        string category;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 timestamp;
    }
    
    struct VaultMatch {
        uint256 vaultId;
        uint256 matchScore;
        string reason;
    }
    
    mapping(address => Intent[]) public userIntents;
    mapping(string => VaultMatch[]) public categoryMatches;
    
    event IntentParsed(address indexed user, string query, uint256 intentId);
    event VaultMatched(string query, uint256 vaultId, uint256 score);
    
    function parseIntent(
        string memory _query,
        uint256 _minAPR,
        uint256 _maxRisk,
        string memory _category,
        uint256 _minAmount,
        uint256 _maxAmount
    ) external returns (uint256) {
        Intent memory newIntent = Intent({
            query: _query,
            minAPR: _minAPR,
            maxRisk: _maxRisk,
            category: _category,
            minAmount: _minAmount,
            maxAmount: _maxAmount,
            timestamp: block.timestamp
        });
        
        userIntents[msg.sender].push(newIntent);
        uint256 intentId = userIntents[msg.sender].length - 1;
        
        emit IntentParsed(msg.sender, _query, intentId);
        return intentId;
    }
    
    function matchVaults(string memory _query) external view returns (VaultMatch[] memory) {
        return categoryMatches[_query];
    }
    
    function addVaultMatch(
        string memory _category,
        uint256 _vaultId,
        uint256 _score,
        string memory _reason
    ) external onlyOwner {
        categoryMatches[_category].push(VaultMatch({
            vaultId: _vaultId,
            matchScore: _score,
            reason: _reason
        }));
        
        emit VaultMatched(_category, _vaultId, _score);
    }
}
