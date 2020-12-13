// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./interfaces/IBEP20.sol";
import "./interfaces/IVenus.sol";

contract Venus {
    address internal tokenAddress;
    address internal vTokenAddress;

    constructor() public {
        // BUSD Address: 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47
        // vBUSD Address: 0x08e0A5575De71037aE36AbfAfb516595fE68e5e4
        tokenAddress = 0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47;
        vTokenAddress = 0x08e0A5575De71037aE36AbfAfb516595fE68e5e4;
    }

    receive() external payable {}

    function deposit(uint256 amount) internal returns (bool) {
        // Approve vBUSD contract to move your BUSD
        require(
            IBEP20(tokenAddress).approve(vTokenAddress, amount),
            "Venus: Approve Failed !!"
        );

        // Deposit Token to lending pool
        uint256 result = IVenus(vTokenAddress).mint(amount);

        return result == 0 ? true : false;
    }

    function withdraw(uint256 amount) internal returns (bool) {
        // Withdraw Token for pool
        uint256 result = IVenus(vTokenAddress).redeemUnderlying(amount);

        return result == 0 ? true : false;
    }

    function getPoolBalance() public view returns (uint256) {
        uint256 balance = IBEP20(vTokenAddress).balanceOf(address(this));
        uint256 cash = IVenus(vTokenAddress).getCash();
        uint256 totalBorrows = IVenus(vTokenAddress).totalBorrows();
        uint256 totalReserves = IVenus(vTokenAddress).totalReserves();
        uint256 totalSupply = IVenus(vTokenAddress).totalSupply();

        uint256 exchangeRate = (cash + totalBorrows - totalReserves) /
            totalSupply;

        return exchangeRate * balance;
    }
}
