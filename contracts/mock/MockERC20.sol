// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title A mintable and burnable ERC20 token, used only for tests.
contract MockERC20 is ERC20 {
    constructor() ERC20("MockToken", "MCKT") {
        _mint(msg.sender, 100 ether);
    }

    /// @notice Mint an amount of tokens to an account.
    /// @param account The address receiving the tokens.
    /// @param amount The amount of tokens the account receives in wei.
    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    /// @notice Burn an amount of tokens from an account.
    /// @param account The address from which the tokens are burnt from.
    /// @param amount The amount of tokens burnt in wei.
    function burn(address account, uint256 amount) external {
        _burn(account, amount);
    }
}
