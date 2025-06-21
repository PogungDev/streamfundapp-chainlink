// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DurationLogic is Ownable {
    struct VaultDuration {
        uint256 vaultId;
        uint256 startTime;
        uint256 duration; // in months
        uint256 lockUntil;
        bool isActive;
        bool canExtend;
    }
    
    mapping(uint256 => VaultDuration) public vaultDurations;
    mapping(uint256 => bool) public isVaultExpired;
    
    uint256 public constant MIN_DURATION = 6; // 6 months minimum
    uint256 public constant MAX_DURATION = 36; // 36 months maximum
    uint256 public constant SECONDS_PER_MONTH = 30 days;
    
    event DurationSet(uint256 indexed vaultId, uint256 duration, uint256 lockUntil);
    event VaultExpired(uint256 indexed vaultId);
    event DurationExtended(uint256 indexed vaultId, uint256 newLockUntil);
    
    function setVaultDuration(
        uint256 _vaultId,
        uint256 _durationMonths
    ) external onlyOwner {
        require(_durationMonths >= MIN_DURATION, "Duration too short");
        require(_durationMonths <= MAX_DURATION, "Duration too long");
        
        uint256 lockUntil = block.timestamp + (_durationMonths * SECONDS_PER_MONTH);
        
        vaultDurations[_vaultId] = VaultDuration({
            vaultId: _vaultId,
            startTime: block.timestamp,
            duration: _durationMonths,
            lockUntil: lockUntil,
            isActive: true,
            canExtend: true
        });
        
        emit DurationSet(_vaultId, _durationMonths, lockUntil);
    }
    
    function checkVaultExpiry(uint256 _vaultId) external returns (bool) {
        VaultDuration storage vaultDur = vaultDurations[_vaultId];
        
        if (block.timestamp >= vaultDur.lockUntil && vaultDur.isActive) {
            vaultDur.isActive = false;
            isVaultExpired[_vaultId] = true;
            emit VaultExpired(_vaultId);
            return true;
        }
        
        return false;
    }
    
    function extendVaultDuration(
        uint256 _vaultId,
        uint256 _additionalMonths
    ) external onlyOwner {
        VaultDuration storage vaultDur = vaultDurations[_vaultId];
        require(vaultDur.canExtend, "Cannot extend this vault");
        require(!isVaultExpired[_vaultId], "Vault already expired");
        
        uint256 additionalTime = _additionalMonths * SECONDS_PER_MONTH;
        vaultDur.lockUntil += additionalTime;
        vaultDur.duration += _additionalMonths;
        
        emit DurationExtended(_vaultId, vaultDur.lockUntil);
    }
    
    function getVaultDuration(uint256 _vaultId) external view returns (VaultDuration memory) {
        return vaultDurations[_vaultId];
    }
    
    function getRemainingTime(uint256 _vaultId) external view returns (uint256) {
        VaultDuration memory vaultDur = vaultDurations[_vaultId];
        if (block.timestamp >= vaultDur.lockUntil) {
            return 0;
        }
        return vaultDur.lockUntil - block.timestamp;
    }
}
