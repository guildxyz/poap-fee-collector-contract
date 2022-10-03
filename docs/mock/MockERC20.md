# MockERC20

A mintable and burnable ERC20 token, used only for tests.

## Functions

### constructor

```solidity
constructor() 
```

### mint

```solidity
function mint(
    address account,
    uint256 amount
) external
```

Mint an amount of tokens to an account.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `account` | address | The address receiving the tokens. |
| `amount` | uint256 | The amount of tokens the account receives in wei. |

### burn

```solidity
function burn(
    address account,
    uint256 amount
) external
```

Burn an amount of tokens from an account.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `account` | address | The address from which the tokens are burnt from. |
| `amount` | uint256 | The amount of tokens burnt in wei. |

