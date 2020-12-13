// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Pool.sol";

contract PoolFactory {
    // 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47
    uint256 public totalPools;

    address[] public availablePools;

    struct PoolInfo {
        uint256 depositAmount;
        uint256 minimumBidAmount;
        uint256 auctionInterval;
        uint256 auctionDuration;
        uint8 maxParticipants;
        address tokenAddress;
        uint256 createdAt;
    }

    mapping(address => PoolInfo) public poolInfo;

    event NewPool(
        uint256 id,
        address poolAddress,
        uint256 depositAmount,
        uint256 minimumBidAmount,
        uint256 auctionInterval,
        uint256 auctionDuration,
        uint8 maxParticipants,
        address tokenAddress,
        address creator,
        uint256 createdAt
    );

    function addPool(
        uint256 maximumBidAmount,
        uint256 minimumBidAmount,
        uint256 auctionInterval,
        uint256 auctionDuration,
        uint8 maxParticipants,
        address token
    ) public {
        Pool newPool = new Pool(
            maximumBidAmount,
            minimumBidAmount,
            auctionInterval,
            auctionDuration,
            maxParticipants,
            token
        );

        totalPools++;

        poolInfo[address(newPool)] = PoolInfo(
            maximumBidAmount * maxParticipants,
            minimumBidAmount,
            auctionInterval,
            auctionDuration,
            maxParticipants,
            token,
            block.timestamp
        );

        availablePools.push(address(newPool));

        emit NewPool(
            totalPools,
            address(newPool),
            maximumBidAmount * maxParticipants,
            minimumBidAmount,
            auctionInterval,
            auctionDuration,
            maxParticipants,
            token,
            msg.sender,
            block.timestamp
        );
    }
}
