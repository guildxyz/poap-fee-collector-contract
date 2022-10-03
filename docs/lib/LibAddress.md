# LibAddress

Library for functions related to addresses.

## Functions

### sendEther

```solidity
function sendEther(
    address payable recipient,
    uint256 amount
) internal
```

Send ether to an address, forwarding all available gas and reverting on errors.

#### Parameters

| Name | Type | Description |
| :--- | :--- | :---------- |
| `recipient` | address payable | The recipient of the ether. |
| `amount` | uint256 | The amount of ether to send in wei. |

## Custom errors

### FailedToSendEther

```solidity
error FailedToSendEther(address recipient)
```

Error thrown when sending ether fails.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address that could not receive the ether. |

