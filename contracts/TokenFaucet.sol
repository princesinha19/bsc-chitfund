pragma solidity ^0.6.0;

import "./interfaces/IBEP20.sol";

contract TokenFaucet {
    mapping(address => mapping(address => bool)) public alreadyClaimed;

    function claimTestTokens(address token) public {
        require(
            !alreadyClaimed[msg.sender][token],
            "You have already claimed your 100 test tokens !!"
        );

        alreadyClaimed[msg.sender][token] = true;

        uint256 decimals = IBEP20(token).decimals();

        IBEP20(token).transfer(msg.sender, 100 * 10**decimals);
    }

    function getContractBalance(address token) public view returns (uint256) {
        uint256 decimals = IBEP20(token).decimals();

        return IBEP20(token).balanceOf(address(this)) / 10**decimals;
    }
}
