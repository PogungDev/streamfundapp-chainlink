// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MockLIFIAdapter is Ownable {
    struct CrossChainSwap {
        address user;
        string fromChain;
        string toChain;
        address fromToken;
        address toToken;
        uint256 inputAmount;
        uint256 outputAmount;
        uint256 estimatedTime;
        uint256 bridgeFee;
        bool isCompleted;
        uint256 timestamp;
    }
    
    mapping(bytes32 => CrossChainSwap) public swaps;
    mapping(string => bool) public supportedChains;
    mapping(string => uint256) public chainGasFees;
    
    event SwapInitiated(bytes32 indexed swapId, address user, string fromChain, string toChain);
    event SwapCompleted(bytes32 indexed swapId, uint256 outputAmount);
    event ChainAdded(string chainName, uint256 gasFee);
    
    constructor() {
        // Initialize supported chains
        supportedChains["Ethereum"] = true;
        supportedChains["Polygon"] = true;
        supportedChains["Arbitrum"] = true;
        supportedChains["Optimism"] = true;
        supportedChains["Base"] = true;
        supportedChains["Metis"] = true;
        
        // Set gas fees (in wei equivalent)
        chainGasFees["Ethereum"] = 50 * 10**6; // $50 USDC
        chainGasFees["Polygon"] = 1 * 10**6;   // $1 USDC
        chainGasFees["Arbitrum"] = 5 * 10**6;  // $5 USDC
        chainGasFees["Optimism"] = 3 * 10**6;  // $3 USDC
        chainGasFees["Base"] = 2 * 10**6;      // $2 USDC
        chainGasFees["Metis"] = 1 * 10**6;     // $1 USDC
    }
    
    function estimateSwap(
        string memory _fromChain,
        string memory _toChain,
        uint256 _amount
    ) external view returns (uint256 outputAmount, uint256 bridgeFee, uint256 estimatedTime) {
        require(supportedChains[_fromChain], "From chain not supported");
        require(supportedChains[_toChain], "To chain not supported");
        
        // Calculate bridge fee
        bridgeFee = chainGasFees[_fromChain] + chainGasFees[_toChain];
        
        // Calculate output amount (0.3% swap fee)
        uint256 swapFee = (_amount * 30) / 10000;
        outputAmount = _amount - swapFee - bridgeFee;
        
        // Estimate time based on chains
        if (keccak256(bytes(_fromChain)) == keccak256(bytes(_toChain))) {
            estimatedTime = 30; // 30 seconds for same chain
        } else {
            estimatedTime = 300; // 5 minutes for cross-chain
        }
        
        return (outputAmount, bridgeFee, estimatedTime);
    }
    
    function initiateSwap(
        string memory _fromChain,
        string memory _toChain,
        address _fromToken,
        address _toToken,
        uint256 _inputAmount
    ) external returns (bytes32) {
        require(_inputAmount > 0, "Invalid amount");
        
        (uint256 outputAmount, uint256 bridgeFee, uint256 estimatedTime) = this.estimateSwap(
            _fromChain,
            _toChain,
            _inputAmount
        );
        
        bytes32 swapId = keccak256(abi.encodePacked(
            msg.sender,
            _fromChain,
            _toChain,
            _inputAmount,
            block.timestamp
        ));
        
        swaps[swapId] = CrossChainSwap({
            user: msg.sender,
            fromChain: _fromChain,
            toChain: _toChain,
            fromToken: _fromToken,
            toToken: _toToken,
            inputAmount: _inputAmount,
            outputAmount: outputAmount,
            estimatedTime: estimatedTime,
            bridgeFee: bridgeFee,
            isCompleted: false,
            timestamp: block.timestamp
        });
        
        emit SwapInitiated(swapId, msg.sender, _fromChain, _toChain);
        return swapId;
    }
    
    function completeSwap(bytes32 _swapId) external onlyOwner {
        CrossChainSwap storage swap = swaps[_swapId];
        require(!swap.isCompleted, "Swap already completed");
        
        swap.isCompleted = true;
        emit SwapCompleted(_swapId, swap.outputAmount);
    }
    
    function getSwap(bytes32 _swapId) external view returns (CrossChainSwap memory) {
        return swaps[_swapId];
    }
}
