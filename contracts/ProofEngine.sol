// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ProofEngine is Ownable {
    using ECDSA for bytes32;
    
    enum ProofType {
        REVENUE_PROOF,
        PERFORMANCE_PROOF,
        PAYOUT_PROOF,
        AUDIT_PROOF,
        IDENTITY_PROOF
    }
    
    struct Proof {
        uint256 proofId;
        ProofType proofType;
        address creator;
        uint256 vaultId;
        bytes32 dataHash;
        bytes32 merkleRoot;
        string ipfsHash;
        address verifier;
        uint256 timestamp;
        bool isVerified;
        uint256 expiryTime;
    }
    
    struct ProofSubmission {
        uint256 proofId;
        bytes data;
        bytes signature;
        bytes32[] merkleProof;
        string metadata;
    }
    
    mapping(uint256 => Proof) public proofs;
    mapping(uint256 => uint256[]) public vaultProofs;
    mapping(address => uint256[]) public creatorProofs;
    mapping(address => bool) public authorizedVerifiers;
    
    uint256 public proofCounter;
    uint256 public constant PROOF_VALIDITY_PERIOD = 30 days;
    
    event ProofSubmitted(uint256 indexed proofId, ProofType proofType, address indexed creator, uint256 indexed vaultId);
    event ProofVerified(uint256 indexed proofId, address indexed verifier);
    event ProofExpired(uint256 indexed proofId);
    
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }
    
    function addAuthorizedVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = true;
    }
    
    function removeAuthorizedVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = false;
    }
    
    function submitProof(
        ProofType _proofType,
        address _creator,
        uint256 _vaultId,
        bytes memory _data,
        bytes32 _merkleRoot,
        string memory _ipfsHash,
        bytes memory _signature
    ) external onlyOwner returns (uint256) {
        proofCounter++;
        uint256 proofId = proofCounter;
        
        bytes32 dataHash = keccak256(_data);
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(_proofType, _creator, _vaultId, dataHash));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(_signature);
        
        require(signer == _creator, "Invalid signature");
        
        proofs[proofId] = Proof({
            proofId: proofId,
            proofType: _proofType,
            creator: _creator,
            vaultId: _vaultId,
            dataHash: dataHash,
            merkleRoot: _merkleRoot,
            ipfsHash: _ipfsHash,
            verifier: address(0),
            timestamp: block.timestamp,
            isVerified: false,
            expiryTime: block.timestamp + PROOF_VALIDITY_PERIOD
        });
        
        vaultProofs[_vaultId].push(proofId);
        creatorProofs[_creator].push(proofId);
        
        emit ProofSubmitted(proofId, _proofType, _creator, _vaultId);
        return proofId;
    }
    
    function verifyProof(
        uint256 _proofId,
        bytes memory _originalData,
        bytes32[] memory _merkleProof
    ) external onlyAuthorizedVerifier returns (bool) {
        Proof storage proof = proofs[_proofId];
        require(proof.proofId != 0, "Proof not found");
        require(!proof.isVerified, "Already verified");
        require(block.timestamp <= proof.expiryTime, "Proof expired");
        
        // Verify data integrity
        bytes32 computedHash = keccak256(_originalData);
        require(computedHash == proof.dataHash, "Data hash mismatch");
        
        // Verify merkle proof (simplified)
        bytes32 leaf = keccak256(abi.encodePacked(proof.creator, proof.vaultId, computedHash));
        bool merkleValid = verifyMerkleProof(_merkleProof, proof.merkleRoot, leaf);
        require(merkleValid, "Invalid merkle proof");
        
        proof.isVerified = true;
        proof.verifier = msg.sender;
        
        emit ProofVerified(_proofId, msg.sender);
        return true;
    }
    
    function verifyMerkleProof(
        bytes32[] memory _proof,
        bytes32 _root,
        bytes32 _leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = _leaf;
        
        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];
            
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == _root;
    }
    
    function getProof(uint256 _proofId) external view returns (Proof memory) {
        return proofs[_proofId];
    }
    
    function getVaultProofs(uint256 _vaultId) external view returns (uint256[] memory) {
        return vaultProofs[_vaultId];
    }
    
    function getCreatorProofs(address _creator) external view returns (uint256[] memory) {
        return creatorProofs[_creator];
    }
    
    function isProofValid(uint256 _proofId) external view returns (bool) {
        Proof memory proof = proofs[_proofId];
        return proof.isVerified && block.timestamp <= proof.expiryTime;
    }
    
    function expireProof(uint256 _proofId) external onlyOwner {
        Proof storage proof = proofs[_proofId];
        require(proof.proofId != 0, "Proof not found");
        require(block.timestamp > proof.expiryTime, "Proof not expired yet");
        
        proof.isVerified = false;
        emit ProofExpired(_proofId);
    }
}
