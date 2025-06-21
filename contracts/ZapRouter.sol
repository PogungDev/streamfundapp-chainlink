// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ZapRouter is Ownable, ReentrancyGuard {
    struct ZapTransaction {
        address investor;
        uint256 vaultId;
        uint256 inputAmount;
        uint256 outputAmount;
        string fromChain;
        string toChain;
        uint256 timestamp;
        bool isCompleted;
    }
    
    mapping(bytes32 => ZapTransaction) public zapTransactions;
    mapping(address => bytes32[]) public userTransactions;
    
    uint256 public zapFee = 30; // 0.3% fee
    uint256 public bridgeFee = 5 * 10**6; // $5 USDC bridge fee
    
    event ZapInitiated(bytes32 indexed txHash, address investor, uint256 vaultId, uint256 amount);
    event ZapCompleted(bytes32 indexed txHash, uint256 outputAmount);
    event CrossChainBridge(string fromChain, string toChain, uint256 amount);
    
    function initiateZap(
        uint256 _vaultId,
        uint256 _inputAmount,
        string memory _fromChain,
        string memory _toChain
    ) external nonReentrant returns (bytes32) {
        require(_inputAmount > 0, "Invalid amount");
        
        // Calculate fees
        uint256 swapFee = (_inputAmount * zapFee) / 10000;
        uint256 totalFees = swapFee;
        
        // Add bridge fee if cross-chain
        if (keccak256(bytes(_fromChain)) != keccak256(bytes(_toChain))) {
            totalFees += bridgeFee;
        }
        
        uint256 outputAmount = _inputAmount - totalFees;
        
        bytes32 txHash = keccak256(abi.encodePacked(
            msg.sender,
            _vaultId,
            _inputAmount,
            block.timestamp
        ));
        
        zapTransactions[txHash] = ZapTransaction({
            investor: msg.sender,
            vaultId: _vaultId,
            inputAmount: _inputAmount,
            outputAmount: outputAmount,
            fromChain: _fromChain,
            toChain: _toChain,
            timestamp: block.timestamp,
            isCompleted: false
        });
        
        userTransactions[msg.sender].push(txHash);
        
        emit ZapInitiated(txHash, msg.sender, _vaultId, _inputAmount);
        emit CrossChainBridge(_fromChain, _toChain, _inputAmount);
        
        return txHash;
    }
    
    function completeZap(bytes32 _txHash) external onlyOwner {
        ZapTransaction storage zap = zapTransactions[_txHash];
        require(!zap.isCompleted, "Already completed");
        
        zap.isCompleted = true;
        emit ZapCompleted(_txHash, zap.outputAmount);
    }
    
    function getZapTransaction(bytes32 _txHash) external view returns (ZapTransaction memory) {
        return zapTransactions[_txHash];
    }
    
    function getUserTransactions(address _user) external view returns (bytes32[] memory) {
        return userTransactions[_user];
    }
}
