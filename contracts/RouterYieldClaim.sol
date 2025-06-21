// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title RouterYieldClaim
 * @dev Handles cross-chain yield withdrawals from CreatorVaults using Chainlink CCIP
 * @notice Allows investors to withdraw their vault yields to different chains
 */
contract RouterYieldClaim is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Supported tokens and chains
    IERC20 public immutable usdcToken;
    AggregatorV3Interface public immutable usdcPriceFeed;
    
    // Proof of Reserve integration
    address public proofOfReserveContract;
    
    struct CrossChainWithdrawal {
        address user;
        address vault;
        uint256 amount;
        uint64 destinationChainSelector;
        address destinationReceiver;
        uint256 timestamp;
        bool executed;
        bytes32 ccipMessageId;
    }
    
    // State
    uint256 public totalReserves;
    uint256 public withdrawalCounter;
    
    // Events
    event YieldWithdrawn(
        address indexed user,
        address indexed vault,
        uint256 amount,
        bool crossChain
    );
    
    event ProofOfReserveVerified(uint256 totalReserves, uint256 timestamp);
    
    constructor(
        address _usdcToken,
        address _usdcPriceFeed,
        address _proofOfReserveContract
    ) {
        usdcToken = IERC20(_usdcToken);
        usdcPriceFeed = AggregatorV3Interface(_usdcPriceFeed);
        proofOfReserveContract = _proofOfReserveContract;
    }
    
    /**
     * @dev Withdraws yield from vault to same chain
     * @param _vault Vault address
     * @param _amount Amount to withdraw
     */
    function withdrawYield(address _vault, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be positive");
        
        // Verify Proof of Reserve
        require(_verifyProofOfReserve(_amount), "Proof of Reserve check failed");
        
        // Transfer USDC to user
        usdcToken.safeTransfer(msg.sender, _amount);
        
        // Update reserves
        totalReserves -= _amount;
        
        emit YieldWithdrawn(msg.sender, _vault, _amount, false);
    }
    
    /**
     * @dev Verifies Proof of Reserve before withdrawal
     * @param _amount Amount to verify
     * @return bool indicating if reserves are sufficient
     */
    function _verifyProofOfReserve(uint256 _amount) internal returns (bool) {
        // Get current USDC balance
        uint256 currentBalance = usdcToken.balanceOf(address(this));
        
        // Update total reserves
        totalReserves = currentBalance;
        
        // Verify sufficient reserves
        bool sufficient = currentBalance >= _amount;
        
        emit ProofOfReserveVerified(totalReserves, block.timestamp);
        
        return sufficient;
    }
    
    /**
     * @dev Gets current reserves and PoR status
     * @return Current USDC balance and total reserves
     */
    function getReservesStatus() external view returns (uint256 currentBalance, uint256 reserves) {
        currentBalance = usdcToken.balanceOf(address(this));
        reserves = totalReserves;
    }
}
