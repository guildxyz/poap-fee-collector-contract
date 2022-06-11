// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import { IFeeCollector } from "./interfaces/IFeeCollector.sol";
import { LibAddress } from "./lib/LibAddress.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FeeCollector is IFeeCollector {
    using LibAddress for address payable;

    address payable public guildFeeCollector;
    uint96 public guildSharex100;

    address payable public poapFeeCollector;
    uint96 public poapSharex100;

    Vault[] internal vaults;

    constructor(
        address payable guildFeeCollector_,
        uint96 guildSharex100_,
        address payable poapFeeCollector_,
        uint96 poapSharex100_
    ) {
        guildFeeCollector = guildFeeCollector_;
        guildSharex100 = guildSharex100_;
        poapFeeCollector = poapFeeCollector_;
        poapSharex100 = poapSharex100_;
    }

    function registerVault(
        uint256 eventId,
        address owner,
        address token,
        uint128 fee
    ) external {
        Vault storage vault = vaults.push();
        vault.eventId = eventId;
        vault.owner = owner;
        vault.token = token;
        vault.fee = fee;
        emit VaultRegistered(vaults.length - 1, eventId, owner, token, fee);
    }

    function payFee(uint256 vaultId) external payable {
        if (vaultId >= vaults.length) revert VaultDoesNotExist(vaultId);

        uint256 requiredAmount = vaults[vaultId].fee;
        vaults[vaultId].collected += uint128(requiredAmount);
        vaults[vaultId].paid[msg.sender] = true;

        // If the tokenAddress is zero, the payment should be in Ether, otherwise in ERC20.
        address tokenAddress = vaults[vaultId].token;
        if (tokenAddress == address(0)) {
            if (msg.value != requiredAmount) revert IncorrectFee(vaultId, msg.value, requiredAmount);
        } else {
            if (msg.value != 0) revert IncorrectFee(vaultId, msg.value, 0);
            if (!IERC20(vaults[vaultId].token).transferFrom(msg.sender, address(this), requiredAmount))
                revert TransferFailed(msg.sender, address(this));
        }

        emit FeeReceived(vaultId, msg.sender, requiredAmount);
    }

    function withdraw(uint256 vaultId) external {
        if (vaultId >= vaults.length) revert VaultDoesNotExist(vaultId);

        uint256 collected = vaults[vaultId].collected;
        vaults[vaultId].collected = 0;

        uint256 guildAmount = (collected * poapSharex100) / 10000;
        uint256 poapAmount = (collected * poapSharex100) / 10000;
        uint256 ownerAmount = collected - poapAmount - guildAmount;

        // If the tokenAddress is zero, the collected fees are in Ether, otherwise in ERC20.
        address tokenAddress = vaults[vaultId].token;
        if (tokenAddress == address(0)) _withdrawEther(guildAmount, poapAmount, ownerAmount, vaults[vaultId].owner);
        else _withdrawToken(guildAmount, poapAmount, ownerAmount, vaults[vaultId].owner, tokenAddress);

        emit Withdrawn(vaultId, guildAmount, poapAmount, ownerAmount);
    }

    function setGuildFeeCollector(address payable newFeeCollector) external {
        if (msg.sender != guildFeeCollector) revert OnlyOwner(msg.sender, guildFeeCollector);
        guildFeeCollector = newFeeCollector;
        emit GuildFeeCollectorChanged(newFeeCollector);
    }

    function setGuildSharex100(uint96 newShare) external {
        if (msg.sender != guildFeeCollector) revert OnlyOwner(msg.sender, guildFeeCollector);
        guildSharex100 = newShare;
        emit GuildSharex100Changed(newShare);
    }

    function setPoapFeeCollector(address payable newFeeCollector) external {
        if (msg.sender != poapFeeCollector) revert OnlyOwner(msg.sender, poapFeeCollector);
        poapFeeCollector = newFeeCollector;
        emit PoapFeeCollectorChanged(newFeeCollector);
    }

    function setPoapSharex100(uint96 newShare) external {
        if (msg.sender != poapFeeCollector) revert OnlyOwner(msg.sender, poapFeeCollector);
        poapSharex100 = newShare;
        emit PoapSharex100Changed(newShare);
    }

    function getVault(uint256 vaultId)
        external
        view
        returns (
            uint256 eventId,
            address owner,
            address token,
            uint128 fee,
            uint128 collected
        )
    {
        if (vaultId >= vaults.length) revert VaultDoesNotExist(vaultId);
        Vault storage vault = vaults[vaultId];
        return (vault.eventId, vault.owner, vault.token, vault.fee, vault.collected);
    }

    function hasPaid(uint256 vaultId, address account) external view returns (bool paid) {
        if (vaultId >= vaults.length) revert VaultDoesNotExist(vaultId);
        return vaults[vaultId].paid[account];
    }

    function _withdrawEther(
        uint256 guildAmount,
        uint256 poapAmount,
        uint256 ownerAmount,
        address eventOwner
    ) internal {
        guildFeeCollector.sendEther(guildAmount);
        poapFeeCollector.sendEther(poapAmount);
        payable(eventOwner).sendEther(ownerAmount);
    }

    function _withdrawToken(
        uint256 guildAmount,
        uint256 poapAmount,
        uint256 ownerAmount,
        address eventOwner,
        address tokenAddress
    ) internal {
        IERC20 token = IERC20(tokenAddress);
        if (!token.transfer(guildFeeCollector, guildAmount)) revert TransferFailed(address(this), guildFeeCollector);
        if (!token.transfer(poapFeeCollector, poapAmount)) revert TransferFailed(address(this), poapFeeCollector);
        if (!token.transfer(eventOwner, ownerAmount)) revert TransferFailed(address(this), eventOwner);
    }
}
