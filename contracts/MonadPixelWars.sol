// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Monad Pixel Wars
/// @notice Free onchain collaborative pixel canvas for Monad Mainnet.
/// @dev MVP intentionally avoids upgradeability and complex structs. Future paid priority,
///      seasons, factions, and indexing should be layered around this event-driven core.
contract MonadPixelWars {
    uint16 public constant CANVAS_WIDTH = 128;
    uint16 public constant CANVAS_HEIGHT = 128;
    uint256 public constant MAX_PIXEL_INDEX = 16_383;
    uint256 public constant FREE_COOLDOWN = 30 seconds;

    uint256 public freeCooldown = FREE_COOLDOWN;
    address public owner;

    mapping(uint256 => uint32) public pixels;
    mapping(address => uint256) public nextFreePlacementTime;
    mapping(address => uint256) public totalPlacementsByUser;
    uint256 public totalPlacements;

    event PixelPlaced(
        address indexed user,
        uint16 indexed x,
        uint16 indexed y,
        uint32 color,
        uint256 timestamp,
        uint256 totalPlacements
    );
    event CooldownUpdated(address indexed user, uint256 nextPlacementTime);
    event FreeCooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error InvalidCoordinate();
    error InvalidPixelIndex();
    error InvalidColor();
    error CooldownActive(uint256 nextPlacementTime);
    error WithdrawFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /// @notice Place one free pixel if the caller is not on cooldown.
    /// @dev Future extension points without adding unfinished callable functions:
    ///      - priority placement could add a payable path with a lower separate cooldown
    ///      - seasons could namespace pixel indexes by season id and emit season metadata
    ///      - factions/guilds could map users to teams and index PixelPlaced by team offchain
    function placePixel(uint16 x, uint16 y, uint32 color) external {
        if (x >= CANVAS_WIDTH || y >= CANVAS_HEIGHT) revert InvalidCoordinate();
        if (!_isApprovedColor(color)) revert InvalidColor();

        uint256 nextPlacementTime = nextFreePlacementTime[msg.sender];
        if (block.timestamp < nextPlacementTime) revert CooldownActive(nextPlacementTime);

        uint256 index = _pixelIndex(x, y);
        pixels[index] = color;

        uint256 newTotalPlacements = totalPlacements + 1;
        uint256 newCooldownEnd = block.timestamp + freeCooldown;

        totalPlacements = newTotalPlacements;
        unchecked {
            totalPlacementsByUser[msg.sender] += 1;
        }
        nextFreePlacementTime[msg.sender] = newCooldownEnd;

        emit PixelPlaced(msg.sender, x, y, color, block.timestamp, newTotalPlacements);
        emit CooldownUpdated(msg.sender, newCooldownEnd);
    }

    function getPixel(uint16 x, uint16 y) external view returns (uint32) {
        if (x >= CANVAS_WIDTH || y >= CANVAS_HEIGHT) revert InvalidCoordinate();
        return pixels[_pixelIndex(x, y)];
    }

    function getPixelByIndex(uint256 index) external view returns (uint32) {
        if (index > MAX_PIXEL_INDEX) revert InvalidPixelIndex();
        return pixels[index];
    }

    function getUserCooldown(address user) external view returns (uint256) {
        return nextFreePlacementTime[user];
    }

    function canPlace(address user) public view returns (bool) {
        return block.timestamp >= nextFreePlacementTime[user];
    }

    function getUserStats(address user)
        external
        view
        returns (uint256 totalUserPlacements, uint256 nextPlacementTime, bool canPlaceNow)
    {
        totalUserPlacements = totalPlacementsByUser[user];
        nextPlacementTime = nextFreePlacementTime[user];
        canPlaceNow = block.timestamp >= nextPlacementTime;
    }

    function setFreeCooldown(uint256 newCooldown) external onlyOwner {
        uint256 oldCooldown = freeCooldown;
        freeCooldown = newCooldown;
        emit FreeCooldownUpdated(oldCooldown, newCooldown);
    }

    /// @notice Included for future paid placement mode. MVP placePixel is not payable.
    function withdraw() external onlyOwner {
        (bool success,) = owner.call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "new owner is zero");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function _pixelIndex(uint16 x, uint16 y) internal pure returns (uint256) {
        return uint256(y) * CANVAS_WIDTH + x;
    }

    function _isApprovedColor(uint32 color) internal pure returns (bool) {
        return color == 0x7B3FF2 // Monad Purple
            || color == 0x05050A // Deep Black
            || color == 0xFFFFFF // White
            || color == 0x22D3EE // Electric Blue
            || color == 0xFF3DF2 // Neon Pink
            || color == 0xA3FF12 // Lime Green
            || color == 0xFF8A00 // Orange
            || color == 0xFFE84D // Yellow
            || color == 0xFF2E2E // Red
            || color == 0x00FFF0 // Cyan
            || color == 0x242432 // Dark Gray
            || color == 0xB8B8C7; // Light Gray
    }
}
