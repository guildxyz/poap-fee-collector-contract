# IFeeCollector

## Functions

### registerVault

```solidity
function registerVault(
    uint256 eventId,
    address owner,
    address token,
    uint128 fee
) external
```

Registers a POAP drop and it's fee.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `eventId` | uint256 | The id of the POAP drop. |
| `owner` | address | The address that receives the fees from the drop. |
| `token` | address | The zero address for Ether, otherwise an ERC20 token. |
| `fee` | uint128 | The amount of fee to pay in wei. |

### payFee

```solidity
function payFee(
    uint256 vaultId
) external
```

Registers the paid fee, both in Ether or ERC20.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `vaultId` | uint256 | The id of the vault to pay to. |

### setGuildFeeCollector

```solidity
function setGuildFeeCollector(
    address payable newFeeCollector
) external
```

Sets the address that receives Guild's share from the funds.

Callable only by the current Guild fee collector.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `newFeeCollector` | address payable | The new address of guildFeeCollector. |

### setGuildSharex100

```solidity
function setGuildSharex100(
    uint96 newShare
) external
```

Sets Guild's share from the funds.

Callable only by the Guild fee collector.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `newShare` | uint96 | The percentual value multiplied by 100. |

### setPoapFeeCollector

```solidity
function setPoapFeeCollector(
    address payable newFeeCollector
) external
```

Sets the address that receives POAP's share from the funds.

Callable only by the current POAP fee collector.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `newFeeCollector` | address payable | The new address of poapFeeCollector. |

### setPoapSharex100

```solidity
function setPoapSharex100(
    uint96 newShare
) external
```

Sets POAP's share from the funds.

Callable only by the POAP fee collector.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `newShare` | uint96 | The percentual value multiplied by 100. |

### withdraw

```solidity
function withdraw(
    uint256 vaultId
) external
```

Distributes the funds from a vault to the fee collectors and the owner.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `vaultId` | uint256 | The id of the vault whose funds should be distributed. |

### getVault

```solidity
function getVault(
    uint256 vaultId
) external returns (uint256 eventId, address owner, address token, uint128 fee, uint128 collected)
```

Returns a vault's details.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `vaultId` | uint256 | The id of the queried vault. |

#### Return Values

| Name | Type | Description |
| :--- | :--- | :---------- |
| `eventId` | uint256 | The id of the POAP drop. |
| `owner` | address | The owner of the vault who recieves the funds. |
| `token` | address | The address of the token to receive funds in (the zero address in case of Ether). |
| `fee` | uint128 | The amount of required funds in wei. |
| `collected` | uint128 | The amount of already collected funds. |
### hasPaid

```solidity
function hasPaid(
    uint256 vaultId,
    address account
) external returns (bool paid)
```

Returns if an account has paid the fee to a vault.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `vaultId` | uint256 | The id of the queried vault. |
| `account` | address | The address of the queried account. |

### guildFeeCollector

```solidity
function guildFeeCollector() external returns (address payable)
```

Returns the address that receives Guild's share from the funds.

### guildSharex100

```solidity
function guildSharex100() external returns (uint96)
```

Returns the percentage of Guild's share multiplied by 100.

### poapFeeCollector

```solidity
function poapFeeCollector() external returns (address payable)
```

Returns the address that receives POAP's share from the funds.

### poapSharex100

```solidity
function poapSharex100() external returns (uint96)
```

Returns the percentage of POAP's share multiplied by 100.

## Events

### FeeReceived

```solidity
event FeeReceived(
    uint256 vaultId,
    address account,
    uint256 amount
)
```

Event emitted when a call to {payFee} succeeds.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `vaultId` | uint256 | The id of the vault that received the payment. |
| `account` | address | The address of the account that paid. |
| `amount` | uint256 | The amount of fee received in wei. |
### GuildFeeCollectorChanged

```solidity
event GuildFeeCollectorChanged(
    address newFeeCollector
)
```

Event emitted when the Guild fee collector address is changed.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `newFeeCollector` | address | The address to change guildFeeCollector to. |
### GuildSharex100Changed

```solidity
event GuildSharex100Changed(
    uint96 newShare
)
```

Event emitted when the share of the Guild fee collector changes.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `newShare` | uint96 | The new value of guildSharex100. |
### PoapFeeCollectorChanged

```solidity
event PoapFeeCollectorChanged(
    address newFeeCollector
)
```

Event emitted when the POAP fee collector address is changed.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `newFeeCollector` | address | The address to change poapFeeCollector to. |
### PoapSharex100Changed

```solidity
event PoapSharex100Changed(
    uint96 newShare
)
```

Event emitted when the share of the POAP fee collector changes.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `newShare` | uint96 | The new value of poapSharex100. |
### VaultRegistered

```solidity
event VaultRegistered(
    uint256 vaultId,
    uint256 eventId,
    address owner,
    address token,
    uint256 fee
)
```

Event emitted when a new vault is registered.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `vaultId` | uint256 |  |
| `eventId` | uint256 | The id of the POAP drop. |
| `owner` | address | The address that receives the fees from the drop. |
| `token` | address | The zero address for Ether, otherwise an ERC20 token. |
| `fee` | uint256 | The amount of fee to pay in wei. |
### Withdrawn

```solidity
event Withdrawn(
    uint256 vaultId,
    uint256 guildAmount,
    uint256 poapAmount,
    uint256 ownerAmount
)
```

Event emitted when funds are withdrawn by a vault owner.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `vaultId` | uint256 | The id of the vault. |
| `guildAmount` | uint256 | The amount received by the Guild fee collector in wei. |
| `poapAmount` | uint256 | The amount received by the POAP fee collector in wei. |
| `ownerAmount` | uint256 | The amount received by the vault's owner in wei. |

## Custom errors

### IncorrectFee

```solidity
error IncorrectFee(uint256 vaultId, uint256 paid, uint256 requiredAmount)
```

Error thrown when an incorrect amount of fee is attempted to be paid.

_requiredAmount might be 0 in cases when an ERC20 payment was expected but Ether was received, too._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vaultId | uint256 | The id of the vault. |
| paid | uint256 | The amount of funds received. |
| requiredAmount | uint256 | The amount of fees required by the vault. |

### AccessDenied

```solidity
error AccessDenied(address sender, address owner)
```

Error thrown when a function is attempted to be called by the wrong address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that sent the transaction. |
| owner | address | The address that is allowed to call the function. |

### TransferFailed

```solidity
error TransferFailed(address from, address to)
```

Error thrown when an ERC20 transfer failed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The sender of the token. |
| to | address | The recipient of the token. |

### VaultDoesNotExist

```solidity
error VaultDoesNotExist(uint256 vaultId)
```

Error thrown when a vault does not exist.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| vaultId | uint256 | The id of the requested vault. |

## Custom types

### Vault

```solidity
struct Vault {
  uint256 eventId;
  address owner;
  address token;
  uint128 fee;
  uint128 collected;
  mapping(address => bool) paid;
}
```

