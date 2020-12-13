pragma solidity ^0.6.0;

import "./interfaces/IBEP20.sol";

contract TokenFaucet {
    address token = 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47;

    mapping(address => bool) public isAlreadyClaimed;

    function claimTestTokens() public {
        require(
            !isAlreadyClaimed[msg.sender],
            "You have already claimed your 100 test tokens !!"
        );

        isAlreadyClaimed[msg.sender] = true;

        uint256 decimals = IBEP20(token).decimals();

        IBEP20(token).transfer(msg.sender, 100 * 10**decimals);
    }

    function getContractBalance() public view returns (uint256) {
        uint256 decimals = IBEP20(token).decimals();

        return IBEP20(token).balanceOf(address(this)) / 10**decimals;
    }
}
