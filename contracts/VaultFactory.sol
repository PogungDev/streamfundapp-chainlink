// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "./CreatorVault.sol";

/**
 * @title VaultFactory
 * @dev Factory contract for deploying CreatorVault contracts for YouTube channels
 * @notice Each YouTube channel gets its own dedicated vault contract
 */
contract VaultFactory is Ownable, ReentrancyGuard, AutomationCompatibleInterface {
    
    struct VaultInfo {
        address vaultAddress;
        address creator;
        string channelId;
        string channelName;
        uint256 targetAmount;
        uint256 totalDeposited;
        uint256 createdAt;
        bool isActive;
        bool isFrozen;
    }
    
    // Mappings
    mapping(address => address[]) public creatorVaults; // creator => vault addresses
    mapping(string => address) public channelVaults; // channelId => vault address
    mapping(address => VaultInfo) public vaultInfo; // vault address => info
    mapping(address => uint256) public vaultIndex; // vault address => index in allVaults
    
    // Arrays
    address[] public allVaults;
    address[] public activeVaults;
    
    // Chainlink integrations
    AggregatorV3Interface public immutable usdcPriceFeed;
    
    // Constants
    uint256 public constant MINIMUM_TARGET_AMOUNT = 1000 * 10**6; // $1,000 USDC
    uint256 public constant MAXIMUM_TARGET_AMOUNT = 1000000 * 10**6; // $1,000,000 USDC
    uint256 public constant INACTIVITY_THRESHOLD = 30 days;
    
    // Events
    event VaultCreated(
        address indexed creator,
        address indexed vaultAddress,
        string channelId,
        string channelName,
        uint256 targetAmount
    );
    
    event VaultFrozen(address indexed vaultAddress, string reason);
    event VaultUnfrozen(address indexed vaultAddress);
    event VaultStatusUpdated(address indexed vaultAddress, bool isActive);
    
    constructor(address _usdcPriceFeed) {
        usdcPriceFeed = AggregatorV3Interface(_usdcPriceFeed);
    }
    
    /**
     * @dev Creates a new vault for a YouTube channel
     * @param _channelId YouTube channel ID
     * @param _channelName Channel display name
     * @param _targetAmount Target funding amount in USDC
     * @param _forecastData AI forecast data from Chainlink Functions
     */
    function createVault(
        string memory _channelId,
        string memory _channelName,
        uint256 _targetAmount,
        bytes memory _forecastData
    ) external nonReentrant returns (address vaultAddress) {
        require(bytes(_channelId).length > 0, "Channel ID required");
        require(bytes(_channelName).length > 0, "Channel name required");
        require(_targetAmount >= MINIMUM_TARGET_AMOUNT, "Target amount too low");
        require(_targetAmount <= MAXIMUM_TARGET_AMOUNT, "Target amount too high");
        require(channelVaults[_channelId] == address(0), "Channel already has vault");
        
        // Deploy new CreatorVault
        CreatorVault vault = new CreatorVault(
            msg.sender,
            _channelId,
            _channelName,
            _targetAmount,
            _forecastData,
            address(usdcPriceFeed)
        );
        
        vaultAddress = address(vault);
        
        // Store vault info
        vaultInfo[vaultAddress] = VaultInfo({
            vaultAddress: vaultAddress,
            creator: msg.sender,
            channelId: _channelId,
            channelName: _channelName,
            targetAmount: _targetAmount,
            totalDeposited: 0,
            createdAt: block.timestamp,
            isActive: true,
            isFrozen: false
        });
        
        // Update mappings and arrays
        creatorVaults[msg.sender].push(vaultAddress);
        channelVaults[_channelId] = vaultAddress;
        allVaults.push(vaultAddress);
        activeVaults.push(vaultAddress);
        vaultIndex[vaultAddress] = allVaults.length - 1;
        
        emit VaultCreated(msg.sender, vaultAddress, _channelId, _channelName, _targetAmount);
        
        return vaultAddress;
    }
    
    /**
     * @dev Freezes a vault due to inactivity or other reasons (Chainlink Automation)
     * @param _vaultAddress Address of the vault to freeze
     * @param _reason Reason for freezing
     */
    function freezeVault(address _vaultAddress, string memory _reason) external onlyOwner {
        require(vaultInfo[_vaultAddress].vaultAddress != address(0), "Vault not found");
        require(!vaultInfo[_vaultAddress].isFrozen, "Vault already frozen");
        
        vaultInfo[_vaultAddress].isFrozen = true;
        vaultInfo[_vaultAddress].isActive = false;
        
        // Remove from active vaults array
        _removeFromActiveVaults(_vaultAddress);
        
        // Call freeze function on the vault contract
        CreatorVault(_vaultAddress).freezeVault();
        
        emit VaultFrozen(_vaultAddress, _reason);
    }
    
    /**
     * @dev Unfreezes a vault
     * @param _vaultAddress Address of the vault to unfreeze
     */
    function unfreezeVault(address _vaultAddress) external onlyOwner {
        require(vaultInfo[_vaultAddress].vaultAddress != address(0), "Vault not found");
        require(vaultInfo[_vaultAddress].isFrozen, "Vault not frozen");
        
        vaultInfo[_vaultAddress].isFrozen = false;
        vaultInfo[_vaultAddress].isActive = true;
        
        // Add back to active vaults array
        activeVaults.push(_vaultAddress);
        
        // Call unfreeze function on the vault contract
        CreatorVault(_vaultAddress).unfreezeVault();
        
        emit VaultUnfrozen(_vaultAddress);
    }
    
    /**
     * @dev Updates vault deposit amount when investors inject USDC
     * @param _vaultAddress Vault address
     * @param _newTotalDeposited New total deposited amount
     */
    function updateVaultDeposit(address _vaultAddress, uint256 _newTotalDeposited) external {
        require(vaultInfo[_vaultAddress].vaultAddress != address(0), "Vault not found");
        require(msg.sender == _vaultAddress, "Only vault can update");
        
        vaultInfo[_vaultAddress].totalDeposited = _newTotalDeposited;
    }
    
    /**
     * @dev Gets all vaults for a creator
     * @param _creator Creator address
     * @return Array of vault addresses
     */
    function getCreatorVaults(address _creator) external view returns (address[] memory) {
        return creatorVaults[_creator];
    }
    
    /**
     * @dev Gets all active vaults
     * @return Array of active vault addresses
     */
    function getActiveVaults() external view returns (address[] memory) {
        return activeVaults;
    }
    
    /**
     * @dev Gets vault info by address
     * @param _vaultAddress Vault address
     * @return VaultInfo struct
     */
    function getVaultInfo(address _vaultAddress) external view returns (VaultInfo memory) {
        return vaultInfo[_vaultAddress];
    }
    
    /**
     * @dev Gets vault address by channel ID
     * @param _channelId YouTube channel ID
     * @return Vault address
     */
    function getVaultByChannel(string memory _channelId) external view returns (address) {
        return channelVaults[_channelId];
    }
    
    /**
     * @dev Chainlink Automation - Check if any vaults need to be frozen
     * @param checkData Encoded check data
     * @return upkeepNeeded Whether upkeep is needed
     * @return performData Data for performing upkeep
     */
    function checkUpkeep(bytes calldata checkData) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        address[] memory vaultsToFreeze = new address[](activeVaults.length);
        uint256 freezeCount = 0;
        
        for (uint256 i = 0; i < activeVaults.length; i++) {
            address vaultAddr = activeVaults[i];
            VaultInfo memory info = vaultInfo[vaultAddr];
            
            // Check if vault has been inactive for too long
            if (block.timestamp > info.createdAt + INACTIVITY_THRESHOLD) {
                // Additional check: verify with the vault contract if creator is still active
                try CreatorVault(vaultAddr).isCreatorActive() returns (bool isActive) {
                    if (!isActive) {
                        vaultsToFreeze[freezeCount] = vaultAddr;
                        freezeCount++;
                    }
                } catch {
                    // If call fails, consider for freezing
                    vaultsToFreeze[freezeCount] = vaultAddr;
                    freezeCount++;
                }
            }
        }
        
        if (freezeCount > 0) {
            // Resize array to actual size
            address[] memory actualVaultsToFreeze = new address[](freezeCount);
            for (uint256 i = 0; i < freezeCount; i++) {
                actualVaultsToFreeze[i] = vaultsToFreeze[i];
            }
            
            upkeepNeeded = true;
            performData = abi.encode(actualVaultsToFreeze);
        }
    }
    
    /**
     * @dev Chainlink Automation - Perform upkeep to freeze inactive vaults
     * @param performData Data from checkUpkeep
     */
    function performUpkeep(bytes calldata performData) external override {
        address[] memory vaultsToFreeze = abi.decode(performData, (address[]));
        
        for (uint256 i = 0; i < vaultsToFreeze.length; i++) {
            if (!vaultInfo[vaultsToFreeze[i]].isFrozen) {
                freezeVault(vaultsToFreeze[i], "Automated freeze due to inactivity");
            }
        }
    }
    
    /**
     * @dev Internal function to remove vault from active vaults array
     * @param _vaultAddress Vault address to remove
     */
    function _removeFromActiveVaults(address _vaultAddress) internal {
        for (uint256 i = 0; i < activeVaults.length; i++) {
            if (activeVaults[i] == _vaultAddress) {
                activeVaults[i] = activeVaults[activeVaults.length - 1];
                activeVaults.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get total number of vaults
     * @return Total vault count
     */
    function getTotalVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
    
    /**
     * @dev Get active vault count
     * @return Active vault count
     */
    function getActiveVaultCount() external view returns (uint256) {
        return activeVaults.length;
    }
} 