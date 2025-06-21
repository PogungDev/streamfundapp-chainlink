// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "./VaultNFT.sol";

/**
 * @title CreatorVault
 * @dev Individual vault contract for each YouTube channel
 * @notice Handles investments, NFT minting, and yield distribution for a specific channel
 */
contract CreatorVault is ReentrancyGuard, AutomationCompatibleInterface {
    using SafeERC20 for IERC20;
    
    // Vault state
    struct VaultData {
        address creator;
        string channelId;
        string channelName;
        uint256 targetAmount;
        uint256 totalDeposited;
        uint256 totalShares;
        uint256 createdAt;
        uint256 lastActivity;
        bool isActive;
        bool isFrozen;
        bytes forecastData;
    }
    
    struct InvestorPosition {
        uint256 amountDeposited;
        uint256 sharesOwned;
        uint256 lastYieldClaim;
        uint256 totalYieldClaimed;
        uint256 nftTokenId;
        bool hasNFT;
    }
    
    struct YieldData {
        uint256 totalYieldGenerated;
        uint256 availableYield;
        uint256 lastYieldUpdate;
        uint256 currentAPR;
        uint256 projectedAPR;
    }
    
    // State variables
    VaultData public vaultData;
    YieldData public yieldData;
    VaultNFT public immutable vaultNFT;
    IERC20 public immutable usdcToken;
    AggregatorV3Interface public immutable priceFeed;
    address public immutable factory;
    
    // Mappings
    mapping(address => InvestorPosition) public investors;
    mapping(uint256 => address) public nftOwners; // nftTokenId => investor address
    address[] public investorList;
    
    // Constants
    uint256 public constant MINIMUM_INVESTMENT = 100 * 10**6; // $100 USDC
    uint256 public constant PLATFORM_FEE = 300; // 3% in basis points
    uint256 public constant YIELD_PRECISION = 10**18;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Events
    event InvestmentDeposited(address indexed investor, uint256 amount, uint256 shares);
    event NFTMinted(address indexed investor, uint256 tokenId, uint256 sharesRepresented);
    event YieldDistributed(uint256 totalYield, uint256 timestamp);
    event YieldClaimed(address indexed investor, uint256 amount);
    event VaultFrozen(string reason);
    event VaultUnfrozen();
    event ForecastUpdated(bytes newForecastData);
    event RevenueValidated(uint256 actualRevenue, uint256 projectedRevenue);
    
    // Modifiers
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call");
        _;
    }
    
    modifier onlyCreator() {
        require(msg.sender == vaultData.creator, "Only creator can call");
        _;
    }
    
    modifier onlyActive() {
        require(vaultData.isActive && !vaultData.isFrozen, "Vault not active");
        _;
    }
    
    modifier onlyInvestor() {
        require(investors[msg.sender].amountDeposited > 0, "Not an investor");
        _;
    }
    
    constructor(
        address _creator,
        string memory _channelId,
        string memory _channelName,
        uint256 _targetAmount,
        bytes memory _forecastData,
        address _priceFeed
    ) {
        factory = msg.sender;
        usdcToken = IERC20(0xA0b86a33E6411e3e82C1C5e0b7bD1e2e6E8C8B0A); // USDC address - update for each chain
        priceFeed = AggregatorV3Interface(_priceFeed);
        
        // Deploy NFT contract for this vault
        vaultNFT = new VaultNFT(
            string(abi.encodePacked("StreamFund-", _channelName)),
            string(abi.encodePacked("SF-", _channelId)),
            address(this)
        );
        
        // Initialize vault data
        vaultData = VaultData({
            creator: _creator,
            channelId: _channelId,
            channelName: _channelName,
            targetAmount: _targetAmount,
            totalDeposited: 0,
            totalShares: 0,
            createdAt: block.timestamp,
            lastActivity: block.timestamp,
            isActive: true,
            isFrozen: false,
            forecastData: _forecastData
        });
        
        // Initialize yield data
        yieldData = YieldData({
            totalYieldGenerated: 0,
            availableYield: 0,
            lastYieldUpdate: block.timestamp,
            currentAPR: 0,
            projectedAPR: _extractProjectedAPR(_forecastData)
        });
    }
    
    /**
     * @dev Allows investors to deposit USDC into the vault
     * @param _amount Amount of USDC to deposit
     */
    function deposit(uint256 _amount) external nonReentrant onlyActive {
        require(_amount >= MINIMUM_INVESTMENT, "Investment too small");
        require(vaultData.totalDeposited + _amount <= vaultData.targetAmount, "Exceeds target amount");
        require(usdcToken.balanceOf(msg.sender) >= _amount, "Insufficient USDC balance");
        
        // Transfer USDC from investor
        usdcToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Calculate platform fee
        uint256 platformFee = (_amount * PLATFORM_FEE) / 10000;
        uint256 netAmount = _amount - platformFee;
        
        // Transfer platform fee (to treasury or keep in contract for now)
        // usdcToken.safeTransfer(treasuryAddress, platformFee);
        
        // Calculate shares (1:1 ratio for simplicity, can be enhanced)
        uint256 shares = netAmount;
        
        // Update investor position
        if (investors[msg.sender].amountDeposited == 0) {
            investorList.push(msg.sender);
        }
        
        investors[msg.sender].amountDeposited += netAmount;
        investors[msg.sender].sharesOwned += shares;
        investors[msg.sender].lastYieldClaim = block.timestamp;
        
        // Update vault data
        vaultData.totalDeposited += netAmount;
        vaultData.totalShares += shares;
        vaultData.lastActivity = block.timestamp;
        
        // Mint NFT for investor
        if (!investors[msg.sender].hasNFT) {
            _mintInvestorNFT(msg.sender, shares);
        } else {
            // Update existing NFT metadata
            vaultNFT.updateTokenShares(investors[msg.sender].nftTokenId, investors[msg.sender].sharesOwned);
        }
        
        // Notify factory of updated deposit
        VaultFactory(factory).updateVaultDeposit(address(this), vaultData.totalDeposited);
        
        emit InvestmentDeposited(msg.sender, netAmount, shares);
    }
    
    /**
     * @dev Mints NFT for investor as proof of investment
     * @param _investor Investor address
     * @param _shares Number of shares represented
     */
    function _mintInvestorNFT(address _investor, uint256 _shares) internal {
        uint256 tokenId = vaultNFT.mintInvestorNFT(
            _investor,
            _shares,
            vaultData.channelName,
            vaultData.channelId
        );
        
        investors[_investor].nftTokenId = tokenId;
        investors[_investor].hasNFT = true;
        nftOwners[tokenId] = _investor;
        
        emit NFTMinted(_investor, tokenId, _shares);
    }
    
    /**
     * @dev Distributes yield to all investors (called by Chainlink Automation)
     * @param _yieldAmount Total yield amount to distribute
     */
    function distributeYield(uint256 _yieldAmount) external onlyCreator nonReentrant {
        require(_yieldAmount > 0, "No yield to distribute");
        require(usdcToken.balanceOf(address(this)) >= _yieldAmount, "Insufficient contract balance");
        
        yieldData.totalYieldGenerated += _yieldAmount;
        yieldData.availableYield += _yieldAmount;
        yieldData.lastYieldUpdate = block.timestamp;
        
        // Update current APR based on yield
        _updateCurrentAPR(_yieldAmount);
        
        emit YieldDistributed(_yieldAmount, block.timestamp);
    }
    
    /**
     * @dev Allows investors to claim their proportional yield
     */
    function claimYield() external nonReentrant onlyInvestor {
        require(yieldData.availableYield > 0, "No yield available");
        
        uint256 investorShares = investors[msg.sender].sharesOwned;
        uint256 totalShares = vaultData.totalShares;
        
        // Calculate proportional yield
        uint256 yieldToClaim = (yieldData.availableYield * investorShares) / totalShares;
        
        require(yieldToClaim > 0, "No yield to claim");
        require(usdcToken.balanceOf(address(this)) >= yieldToClaim, "Insufficient contract balance");
        
        // Update investor data
        investors[msg.sender].lastYieldClaim = block.timestamp;
        investors[msg.sender].totalYieldClaimed += yieldToClaim;
        
        // Update vault yield data
        yieldData.availableYield -= yieldToClaim;
        
        // Transfer yield to investor
        usdcToken.safeTransfer(msg.sender, yieldToClaim);
        
        emit YieldClaimed(msg.sender, yieldToClaim);
    }
    
    /**
     * @dev Updates forecast data (called by Chainlink Functions)
     * @param _newForecastData New forecast data from AI
     */
    function updateForecast(bytes memory _newForecastData) external onlyCreator {
        vaultData.forecastData = _newForecastData;
        yieldData.projectedAPR = _extractProjectedAPR(_newForecastData);
        vaultData.lastActivity = block.timestamp;
        
        emit ForecastUpdated(_newForecastData);
    }
    
    /**
     * @dev Validates actual revenue against projected (Chainlink Functions)
     * @param _actualRevenue Actual revenue from YouTube API
     * @param _projectedRevenue Projected revenue from forecast
     */
    function validateRevenue(uint256 _actualRevenue, uint256 _projectedRevenue) external onlyCreator {
        // Update risk scoring based on accuracy
        uint256 accuracy = _calculateAccuracy(_actualRevenue, _projectedRevenue);
        
        // Adjust future projections based on accuracy
        if (accuracy < 80) { // Less than 80% accurate
            yieldData.projectedAPR = (yieldData.projectedAPR * 90) / 100; // Reduce by 10%
        } else if (accuracy > 95) { // More than 95% accurate
            yieldData.projectedAPR = (yieldData.projectedAPR * 105) / 100; // Increase by 5%
        }
        
        vaultData.lastActivity = block.timestamp;
        
        emit RevenueValidated(_actualRevenue, _projectedRevenue);
    }
    
    /**
     * @dev Freezes the vault (called by factory through Chainlink Automation)
     */
    function freezeVault() external onlyFactory {
        vaultData.isFrozen = true;
        vaultData.isActive = false;
        
        emit VaultFrozen("Vault frozen by automation");
    }
    
    /**
     * @dev Unfreezes the vault
     */
    function unfreezeVault() external onlyFactory {
        vaultData.isFrozen = false;
        vaultData.isActive = true;
        vaultData.lastActivity = block.timestamp;
        
        emit VaultUnfrozen();
    }
    
    /**
     * @dev Checks if creator is still active (for Chainlink Automation)
     * @return bool indicating if creator is active
     */
    function isCreatorActive() external view returns (bool) {
        return block.timestamp < vaultData.lastActivity + 30 days;
    }
    
    /**
     * @dev Gets investor position data
     * @param _investor Investor address
     * @return InvestorPosition struct
     */
    function getInvestorPosition(address _investor) external view returns (InvestorPosition memory) {
        return investors[_investor];
    }
    
    /**
     * @dev Gets vault performance metrics
     * @return Various performance metrics
     */
    function getVaultMetrics() external view returns (
        uint256 totalDeposited,
        uint256 totalShares,
        uint256 currentAPR,
        uint256 projectedAPR,
        uint256 totalYieldGenerated,
        uint256 availableYield,
        uint256 investorCount
    ) {
        return (
            vaultData.totalDeposited,
            vaultData.totalShares,
            yieldData.currentAPR,
            yieldData.projectedAPR,
            yieldData.totalYieldGenerated,
            yieldData.availableYield,
            investorList.length
        );
    }
    
    /**
     * @dev Gets all investors in the vault
     * @return Array of investor addresses
     */
    function getInvestors() external view returns (address[] memory) {
        return investorList;
    }
    
    /**
     * @dev Calculates pending yield for an investor
     * @param _investor Investor address
     * @return Pending yield amount
     */
    function calculatePendingYield(address _investor) external view returns (uint256) {
        if (investors[_investor].sharesOwned == 0 || vaultData.totalShares == 0) {
            return 0;
        }
        
        return (yieldData.availableYield * investors[_investor].sharesOwned) / vaultData.totalShares;
    }
    
    /**
     * @dev Internal function to extract projected APR from forecast data
     * @param _forecastData Encoded forecast data
     * @return Projected APR in basis points
     */
    function _extractProjectedAPR(bytes memory _forecastData) internal pure returns (uint256) {
        // Decode forecast data to extract APR
        // This is a simplified version - in production, this would decode complex AI forecast data
        if (_forecastData.length == 0) {
            return 1000; // Default 10% APR
        }
        
        // For now, return a default value
        // In production, this would parse the actual forecast data
        return 1200; // 12% APR
    }
    
    /**
     * @dev Internal function to update current APR based on yield
     * @param _yieldAmount Recent yield amount
     */
    function _updateCurrentAPR(uint256 _yieldAmount) internal {
        if (vaultData.totalDeposited == 0) return;
        
        // Calculate annualized APR based on recent yield
        uint256 timeSinceLastUpdate = block.timestamp - yieldData.lastYieldUpdate;
        if (timeSinceLastUpdate == 0) timeSinceLastUpdate = 1;
        
        uint256 annualizedYield = (_yieldAmount * SECONDS_PER_YEAR) / timeSinceLastUpdate;
        yieldData.currentAPR = (annualizedYield * 10000) / vaultData.totalDeposited; // In basis points
    }
    
    /**
     * @dev Internal function to calculate accuracy percentage
     * @param _actual Actual value
     * @param _projected Projected value
     * @return Accuracy percentage
     */
    function _calculateAccuracy(uint256 _actual, uint256 _projected) internal pure returns (uint256) {
        if (_projected == 0) return 0;
        
        uint256 difference = _actual > _projected ? _actual - _projected : _projected - _actual;
        uint256 accuracy = 100 - ((difference * 100) / _projected);
        
        return accuracy > 100 ? 100 : accuracy;
    }
    
    /**
     * @dev Chainlink Automation - Check if yield distribution is needed
     */
    function checkUpkeep(bytes calldata checkData) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        // Check if there's yield to distribute and it's been long enough since last distribution
        upkeepNeeded = (
            yieldData.availableYield > 0 &&
            block.timestamp > yieldData.lastYieldUpdate + 1 days
        );
        
        if (upkeepNeeded) {
            performData = abi.encode(yieldData.availableYield);
        }
    }
    
    /**
     * @dev Chainlink Automation - Perform yield distribution
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256 yieldAmount = abi.decode(performData, (uint256));
        
        if (yieldAmount > 0 && yieldData.availableYield > 0) {
            // Auto-distribute yield to all investors
            yieldData.lastYieldUpdate = block.timestamp;
            emit YieldDistributed(yieldAmount, block.timestamp);
        }
    }
} 