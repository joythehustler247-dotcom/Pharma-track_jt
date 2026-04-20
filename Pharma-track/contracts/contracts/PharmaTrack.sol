// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PharmaTrack
 * @notice On-chain medicine provenance — tracks batches, strips, and tablet-level sale tokens
 * @dev Uses OpenZeppelin v5 AccessControl, ReentrancyGuard, and Pausable
 */
contract PharmaTrack is AccessControl, ReentrancyGuard, Pausable {

    // ────────────────────────────────────────────────────────────────────────────
    // Roles
    // ────────────────────────────────────────────────────────────────────────────

    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER");
    bytes32 public constant DISTRIBUTOR_ROLE  = keccak256("DISTRIBUTOR");
    bytes32 public constant PHARMACY_ROLE     = keccak256("PHARMACY");

    // ────────────────────────────────────────────────────────────────────────────
    // Structs
    // ────────────────────────────────────────────────────────────────────────────

    struct Batch {
        bytes32 batchId;
        string  medicineName;
        address manufacturer;
        uint256 manufactureDate;
        uint256 expiryDate;
        uint256 totalStrips;
        bool    isActive;
    }

    struct Strip {
        bytes32 stripId;
        bytes32 batchId;
        uint256 stripNumber;
        uint256 tabletsTotal;
        uint256 tabletsRemaining;
        address currentHolder;
        bool    isActive;
    }

    struct SaleToken {
        bytes32 tokenId;
        bytes32 stripId;
        address pharmacy;
        uint256 tabletsSold;
        uint256 timestamp;
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Storage
    // ────────────────────────────────────────────────────────────────────────────

    mapping(bytes32 => Batch)     public batches;
    mapping(bytes32 => Strip)     public strips;
    mapping(bytes32 => SaleToken) public saleTokens;
    mapping(bytes32 => bool)      public batchExists;
    mapping(bytes32 => bool)      public stripExists;
    mapping(bytes32 => bool)      public tokenExists;

    /// @dev Tracks which strip IDs belong to which batch (for getBatchStrips)
    mapping(bytes32 => bytes32[]) private _batchStrips;

    // ────────────────────────────────────────────────────────────────────────────
    // Events
    // ────────────────────────────────────────────────────────────────────────────

    event BatchRegistered(
        bytes32 indexed batchId,
        address manufacturer,
        uint256 timestamp
    );

    event StripRegistered(
        bytes32 indexed stripId,
        bytes32 batchId,
        uint256 stripNumber
    );

    event BatchTransferred(
        bytes32 indexed batchId,
        address from,
        address to,
        string  role
    );

    event SaleTokenCreated(
        bytes32 indexed tokenId,
        bytes32 stripId,
        uint256 tabletsSold
    );

    // ────────────────────────────────────────────────────────────────────────────
    // Custom Errors
    // ────────────────────────────────────────────────────────────────────────────

    error BatchAlreadyExists(bytes32 batchId);
    error BatchNotFound(bytes32 batchId);
    error StripAlreadyExists(bytes32 stripId);
    error StripNotFound(bytes32 stripId);
    error TokenNotFound(bytes32 tokenId);
    error TokenAlreadyExists(bytes32 tokenId);
    error InsufficientTablets(uint256 requested, uint256 available);
    error ExpiryInPast(uint256 expiryDate);
    error NotStripHolder(address caller, address holder);
    error InvalidAmount();

    // ────────────────────────────────────────────────────────────────────────────
    // Constructor
    // ────────────────────────────────────────────────────────────────────────────

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Admin functions
    // ────────────────────────────────────────────────────────────────────────────

    /// @notice Assign a role to a wallet address
    /// @param wallet The wallet address to grant the role to
    /// @param role   The role bytes32 (MANUFACTURER_ROLE, DISTRIBUTOR_ROLE, or PHARMACY_ROLE)
    function assignRole(
        address wallet,
        bytes32 role
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, wallet);
    }

    /// @notice Revoke a role from a wallet address
    /// @param wallet The wallet address to revoke the role from
    /// @param role   The role bytes32
    function revokeActorRole(
        address wallet,
        bytes32 role
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, wallet);
    }

    /// @notice Pause all state-changing operations (emergency)
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpause all operations
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Manufacturer functions
    // ────────────────────────────────────────────────────────────────────────────

    /// @notice Register a new medicine batch on-chain
    /// @param batchId      Unique identifier (keccak256 of batch number)
    /// @param medicineName Human-readable medicine name
    /// @param expiryDate   Unix timestamp of batch expiry
    /// @param totalStrips  Number of blister strips in this batch
    function registerBatch(
        bytes32 batchId,
        string  calldata medicineName,
        uint256 expiryDate,
        uint256 totalStrips
    ) external onlyRole(MANUFACTURER_ROLE) whenNotPaused {
        if (batchExists[batchId]) revert BatchAlreadyExists(batchId);
        if (expiryDate <= block.timestamp) revert ExpiryInPast(expiryDate);
        if (totalStrips == 0 || totalStrips > 10000) revert InvalidAmount();

        batches[batchId] = Batch({
            batchId:         batchId,
            medicineName:    medicineName,
            manufacturer:    msg.sender,
            manufactureDate: block.timestamp,
            expiryDate:      expiryDate,
            totalStrips:     totalStrips,
            isActive:        true
        });

        batchExists[batchId] = true;

        emit BatchRegistered(batchId, msg.sender, block.timestamp);
    }

    /// @notice Register a strip belonging to an existing batch
    /// @param stripId      Unique identifier for the strip
    /// @param batchId      Parent batch ID
    /// @param stripNumber  Sequential number within the batch (1-indexed)
    /// @param tabletsTotal Number of tablets in this strip
    function registerStrip(
        bytes32 stripId,
        bytes32 batchId,
        uint256 stripNumber,
        uint256 tabletsTotal
    ) external onlyRole(MANUFACTURER_ROLE) whenNotPaused {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);
        if (!batches[batchId].isActive) revert BatchNotFound(batchId);
        if (stripExists[stripId]) revert StripAlreadyExists(stripId);
        if (stripNumber == 0) revert InvalidAmount();
        if (tabletsTotal == 0) revert InvalidAmount();

        strips[stripId] = Strip({
            stripId:          stripId,
            batchId:          batchId,
            stripNumber:      stripNumber,
            tabletsTotal:     tabletsTotal,
            tabletsRemaining: tabletsTotal,
            currentHolder:    msg.sender,
            isActive:         true
        });

        stripExists[stripId] = true;
        _batchStrips[batchId].push(stripId);

        emit StripRegistered(stripId, batchId, stripNumber);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Transfer functions
    // ────────────────────────────────────────────────────────────────────────────

    /// @notice Transfer a batch to a distributor (Manufacturer → Distributor)
    /// @param batchId     The batch to transfer
    /// @param distributor The distributor's wallet address
    function transferToDistributor(
        bytes32 batchId,
        address distributor
    ) external onlyRole(MANUFACTURER_ROLE) whenNotPaused {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);
        if (!batches[batchId].isActive) revert BatchNotFound(batchId);
        if (!hasRole(DISTRIBUTOR_ROLE, distributor)) revert InvalidAmount();

        // Update currentHolder on all strips in this batch
        bytes32[] storage stripIds = _batchStrips[batchId];
        for (uint256 i = 0; i < stripIds.length; i++) {
            strips[stripIds[i]].currentHolder = distributor;
        }

        emit BatchTransferred(batchId, msg.sender, distributor, "DISTRIBUTOR");
    }

    /// @notice Transfer a batch to a pharmacy (Distributor → Pharmacy)
    /// @param batchId  The batch to transfer
    /// @param pharmacy The pharmacy's wallet address
    function transferToPharmacy(
        bytes32 batchId,
        address pharmacy
    ) external onlyRole(DISTRIBUTOR_ROLE) whenNotPaused {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);
        if (!batches[batchId].isActive) revert BatchNotFound(batchId);
        if (!hasRole(PHARMACY_ROLE, pharmacy)) revert InvalidAmount();

        // Update currentHolder on all strips in this batch
        bytes32[] storage stripIds = _batchStrips[batchId];
        for (uint256 i = 0; i < stripIds.length; i++) {
            strips[stripIds[i]].currentHolder = pharmacy;
        }

        emit BatchTransferred(batchId, msg.sender, pharmacy, "PHARMACY");
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Pharmacy functions
    // ────────────────────────────────────────────────────────────────────────────

    /// @notice Generate a sale token for a partial tablet sale
    /// @param stripId     The strip being sold from
    /// @param tabletsSold Number of tablets customer is buying
    /// @return tokenId    The generated sale token ID
    function generateSaleToken(
        bytes32 stripId,
        uint256 tabletsSold
    )
        external
        onlyRole(PHARMACY_ROLE)
        whenNotPaused
        nonReentrant
        returns (bytes32 tokenId)
    {
        if (!stripExists[stripId]) revert StripNotFound(stripId);

        Strip storage strip = strips[stripId];

        if (!strip.isActive) revert StripNotFound(stripId);
        if (strip.currentHolder != msg.sender)
            revert NotStripHolder(msg.sender, strip.currentHolder);
        if (tabletsSold == 0) revert InvalidAmount();
        if (tabletsSold > strip.tabletsRemaining)
            revert InsufficientTablets(tabletsSold, strip.tabletsRemaining);

        // Check batch not expired
        Batch storage batch = batches[strip.batchId];
        if (batch.expiryDate <= block.timestamp)
            revert ExpiryInPast(batch.expiryDate);

        // Generate unique token ID
        tokenId = keccak256(
            abi.encodePacked(stripId, msg.sender, block.timestamp, tabletsSold)
        );

        if (tokenExists[tokenId]) revert TokenAlreadyExists(tokenId);

        // Update strip state
        strip.tabletsRemaining -= tabletsSold;
        if (strip.tabletsRemaining == 0) {
            strip.isActive = false;
        }

        // Store the sale token
        saleTokens[tokenId] = SaleToken({
            tokenId:     tokenId,
            stripId:     stripId,
            pharmacy:    msg.sender,
            tabletsSold: tabletsSold,
            timestamp:   block.timestamp
        });

        tokenExists[tokenId] = true;

        emit SaleTokenCreated(tokenId, stripId, tabletsSold);

        return tokenId;
    }

    // ────────────────────────────────────────────────────────────────────────────
    // View functions
    // ────────────────────────────────────────────────────────────────────────────

    /// @notice Verify a sale token — returns the full provenance chain (zero gas)
    /// @param tokenId The sale token to verify
    /// @return The SaleToken, its parent Strip, and the grandparent Batch
    function verifyToken(
        bytes32 tokenId
    ) external view returns (SaleToken memory, Strip memory, Batch memory) {
        if (!tokenExists[tokenId]) revert TokenNotFound(tokenId);

        SaleToken memory token = saleTokens[tokenId];
        Strip     memory strip = strips[token.stripId];
        Batch     memory batch = batches[strip.batchId];

        return (token, strip, batch);
    }

    /// @notice Get all strip IDs for a given batch
    /// @param batchId The batch to query
    /// @return Array of strip IDs
    function getBatchStrips(
        bytes32 batchId
    ) external view returns (bytes32[] memory) {
        if (!batchExists[batchId]) revert BatchNotFound(batchId);
        return _batchStrips[batchId];
    }
}
