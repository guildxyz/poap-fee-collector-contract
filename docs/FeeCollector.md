# FeeCollector

## Variables

### guildFeeCollector

```solidity
address payable guildFeeCollector
```

Returns the address that receives Guild's share from the funds.

### guildSharex100

```solidity
uint96 guildSharex100
```

Returns the percentage of Guild's share multiplied by 100.

### poapFeeCollector

```solidity
address payable poapFeeCollector
```

Returns the address that receives POAP's share from the funds.

### poapSharex100

```solidity
uint96 poapSharex100
```

Returns the percentage of POAP's share multiplied by 100.

### vaults

```solidity
struct IFeeCollector.Vault[] vaults
```

## Functions

### constructor

```solidity
constructor(
    address payable guildFeeCollector_,
    uint96 guildSharex100_,
    address payable poapFeeCollector_,
    uint96 poapSharex100_
) 
```

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `guildFeeCollector_` | address payable | The address that will receive Guild's share from the funds. |
| `guildSharex100_` | uint96 | The percentage of Guild's share multiplied by 100 (e.g 500 for a 5% cut). |
| `poapFeeCollector_` | address payable | The address that will receive POAP's share from the funds. |
| `poapSharex100_` | uint96 | The percentage of POAP's share multiplied by 100 (e.g 500 for a 5% cut). |

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

### _withdrawEther

```solidity
function _withdrawEther(
    uint256 guildAmount,
    uint256 poapAmount,
    uint256 ownerAmount,
    address eventOwner
) internal
```

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `guildAmount` | uint256 |  |
| `poapAmount` | uint256 |  |
| `ownerAmount` | uint256 |  |
| `eventOwner` | address |  |

### _withdrawToken

```solidity
function _withdrawToken(
    uint256 guildAmount,
    uint256 poapAmount,
    uint256 ownerAmount,
    address eventOwner,
    address tokenAddress
) internal
```

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `guildAmount` | uint256 |  |
| `poapAmount` | uint256 |  |
| `ownerAmount` | uint256 |  |
| `eventOwner` | address |  |
| `tokenAddress` | address |  |

