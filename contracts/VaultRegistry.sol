// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultRegistry is Ownable {
    struct Vault {
        uint256 vaultId;
        address creator;
        string creatorName;
        string category;
        uint256 targetAPR;
        uint256 maxFunding;
        uint256 currentFunding;
        uint256 duration;
        uint256 riskScore;
        bool isActive;
        uint256 createdAt;
    }
    
    mapping(uint256 => Vault) public vaults;
    mapping(string => uint256[]) public categoryVaults;
    mapping(address => uint256[]) public creatorVaults;
    
    uint256 public vaultCounter;
    uint256[] public activeVaults;
    
    event VaultRegistered(uint256 indexed vaultId, address indexed creator, string category);
    event VaultFunded(uint256 indexed vaultId, uint256 amount);
    event VaultClosed(uint256 indexed vaultId);
    
    function registerVault(
        address _creator,
        string memory _creatorName,
        string memory _category,
        uint256 _targetAPR,
        uint256 _maxFunding,
        uint256 _duration,
        uint256 _riskScore
    ) external onlyOwner returns (uint256) {
        vaultCounter++;
        uint256 newVaultId = vaultCounter;
        
        vaults[newVaultId] = Vault({
            vaultId: newVaultId,
            creator: _creator,
            creatorName: _creatorName,
            category: _category,
            targetAPR: _targetAPR,
            maxFunding: _maxFunding,
            currentFunding: 0,
            duration: _duration,
            riskScore: _riskScore,
            isActive: true,
            createdAt: block.timestamp
        });
        
        categoryVaults[_category].push(newVaultId);
        creatorVaults[_creator].push(newVaultId);
        activeVaults.push(newVaultId);
        
        emit VaultRegistered(newVaultId, _creator, _category);
        return newVaultId;
    }
    
    function fundVault(uint256 _vaultId, uint256 _amount) external {
        require(vaults[_vaultId].isActive, "Vault not active");
        require(vaults[_vaultId].currentFunding + _amount <= vaults[_vaultId].maxFunding, "Exceeds max funding");
        
        vaults[_vaultId].currentFunding += _amount;
        emit VaultFunded(_vaultId, _amount);
    }
    
    function getVaultsByCategory(string memory _category) external view returns (uint256[] memory) {
        return categoryVaults[_category];
    }
    
    function getAllActiveVaults() external view returns (uint256[] memory) {
        return activeVaults;
    }
}
