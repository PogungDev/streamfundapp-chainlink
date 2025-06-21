// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AuditLogger is Ownable {
    enum EventType {
        VAULT_CREATED,
        INVESTMENT_MADE,
        YIELD_PAID,
        VAULT_TERMINATED,
        RISK_UPDATED,
        APR_CHANGED,
        PAYOUT_EXECUTED,
        EMERGENCY_ACTION
    }
    
    struct AuditEvent {
        uint256 eventId;
        EventType eventType;
        address actor;
        uint256 vaultId;
        uint256 amount;
        string description;
        bytes32 dataHash;
        uint256 timestamp;
        uint256 blockNumber;
        bytes32 transactionHash;
    }
    
    mapping(uint256 => AuditEvent) public auditEvents;
    mapping(uint256 => uint256[]) public vaultEvents;
    mapping(address => uint256[]) public actorEvents;
    mapping(EventType => uint256[]) public eventsByType;
    
    uint256 public eventCounter;
    uint256 public constant MAX_EVENTS_PER_QUERY = 100;
    
    event EventLogged(uint256 indexed eventId, EventType eventType, address indexed actor, uint256 indexed vaultId);
    event AuditTrailRequested(address indexed requester, uint256 fromBlock, uint256 toBlock);
    
    function logEvent(
        EventType _eventType,
        address _actor,
        uint256 _vaultId,
        uint256 _amount,
        string memory _description,
        bytes memory _data
    ) external onlyOwner returns (uint256) {
        eventCounter++;
        uint256 eventId = eventCounter;
        
        bytes32 dataHash = keccak256(_data);
        bytes32 txHash = keccak256(abi.encodePacked(block.timestamp, block.number, eventId));
        
        auditEvents[eventId] = AuditEvent({
            eventId: eventId,
            eventType: _eventType,
            actor: _actor,
            vaultId: _vaultId,
            amount: _amount,
            description: _description,
            dataHash: dataHash,
            timestamp: block.timestamp,
            blockNumber: block.number,
            transactionHash: txHash
        });
        
        // Index by vault
        if (_vaultId > 0) {
            vaultEvents[_vaultId].push(eventId);
        }
        
        // Index by actor
        actorEvents[_actor].push(eventId);
        
        // Index by event type
        eventsByType[_eventType].push(eventId);
        
        emit EventLogged(eventId, _eventType, _actor, _vaultId);
        return eventId;
    }
    
    function logVaultCreation(
        address _creator,
        uint256 _vaultId,
        uint256 _maxFunding,
        uint256 _targetAPR,
        string memory _category
    ) external onlyOwner returns (uint256) {
        string memory description = string(abi.encodePacked(
            "Vault created in category: ", _category,
            " with target APR: ", uintToString(_targetAPR)
        ));
        
        bytes memory data = abi.encode(_creator, _vaultId, _maxFunding, _targetAPR, _category);
        
        return logEvent(
            EventType.VAULT_CREATED,
            _creator,
            _vaultId,
            _maxFunding,
            description,
            data
        );
    }
    
    function logInvestment(
        address _investor,
        uint256 _vaultId,
        uint256 _amount,
        uint256 _expectedAPR
    ) external onlyOwner returns (uint256) {
        string memory description = string(abi.encodePacked(
            "Investment of $", uintToString(_amount),
            " at ", uintToString(_expectedAPR), "% APR"
        ));
        
        bytes memory data = abi.encode(_investor, _vaultId, _amount, _expectedAPR);
        
        return logEvent(
            EventType.INVESTMENT_MADE,
            _investor,
            _vaultId,
            _amount,
            description,
            data
        );
    }
    
    function logYieldPayout(
        address _investor,
        uint256 _vaultId,
        uint256 _payoutAmount,
        uint256 _totalYield
    ) external onlyOwner returns (uint256) {
        string memory description = string(abi.encodePacked(
            "Yield payout of $", uintToString(_payoutAmount),
            " (Total yield: $", uintToString(_totalYield), ")"
        ));
        
        bytes memory data = abi.encode(_investor, _vaultId, _payoutAmount, _totalYield);
        
        return logEvent(
            EventType.YIELD_PAID,
            _investor,
            _vaultId,
            _payoutAmount,
            description,
            data
        );
    }
    
    function getVaultAuditTrail(uint256 _vaultId) external view returns (AuditEvent[] memory) {
        uint256[] memory eventIds = vaultEvents[_vaultId];
        uint256 length = eventIds.length > MAX_EVENTS_PER_QUERY ? MAX_EVENTS_PER_QUERY : eventIds.length;
        
        AuditEvent[] memory events = new AuditEvent[](length);
        
        for (uint256 i = 0; i < length; i++) {
            events[i] = auditEvents[eventIds[i]];
        }
        
        return events;
    }
    
    function getActorAuditTrail(address _actor) external view returns (AuditEvent[] memory) {
        uint256[] memory eventIds = actorEvents[_actor];
        uint256 length = eventIds.length > MAX_EVENTS_PER_QUERY ? MAX_EVENTS_PER_QUERY : eventIds.length;
        
        AuditEvent[] memory events = new AuditEvent[](length);
        
        for (uint256 i = 0; i < length; i++) {
            events[i] = auditEvents[eventIds[i]];
        }
        
        return events;
    }
    
    function getEventsByType(EventType _eventType) external view returns (AuditEvent[] memory) {
        uint256[] memory eventIds = eventsByType[_eventType];
        uint256 length = eventIds.length > MAX_EVENTS_PER_QUERY ? MAX_EVENTS_PER_QUERY : eventIds.length;
        
        AuditEvent[] memory events = new AuditEvent[](length);
        
        for (uint256 i = 0; i < length; i++) {
            events[i] = auditEvents[eventIds[i]];
        }
        
        return events;
    }
    
    function verifyEventIntegrity(uint256 _eventId, bytes memory _originalData) external view returns (bool) {
        AuditEvent memory auditEvent = auditEvents[_eventId];
        bytes32 computedHash = keccak256(_originalData);
        
        return auditEvent.dataHash == computedHash;
    }
    
    function getEventCount() external view returns (uint256) {
        return eventCounter;
    }
    
    function getEventCountByType(EventType _eventType) external view returns (uint256) {
        return eventsByType[_eventType].length;
    }
    
    function uintToString(uint256 _value) internal pure returns (string memory) {
        if (_value == 0) {
            return "0";
        }
        
        uint256 temp = _value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(_value % 10)));
            _value /= 10;
        }
        
        return string(buffer);
    }
}
