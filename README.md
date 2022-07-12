# POAP fee collector smart contract

A smart contract for registering POAP events, their fees and vaults that collect the paid funds.

## Requirements

To run the project you need:

- [Node.js](https://nodejs.org/en/download) development environment (version 14 or newer).
- [Truffle](https://www.trufflesuite.com/truffle) for compiling, deploying and testing (version 5.4.30 or newer).
- (optional) [Ganache](https://github.com/trufflesuite/ganache/releases) environment for local testing (version 7.0.0 or newer).

Your `.env` file should contain the following variables:

```bash
# The private key of your wallet.
PRIVATE_KEY=

# Your infura.io project ID for deploying to Ethereum networks.
INFURA_ID=

# Your API key for verification.
ETHERSCAN_API_KEY=
```

## Setup

Pull the repository from GitHub, then install its dependencies by executing this command:

```bash
npm install
```

### Some additional steps before deployment

Open migrations/2_deploy_fee_collector.js. Notice the top four constants:

```js
const guildFeeCollector = "0x..."; // The address that will receive Guild's share from the funds.
const guildSharex100 = 0; // The percentage of Guild's share multiplied by 100 (e.g 500 for a 5% cut).
const poapFeeCollector = "0x..."; // The address that will receive POAP's share from the funds.
const poapSharex100 = 0; // The percentage of POAP's share multiplied by 100 (e.g 500 for a 5% cut).
```

Edit them according to your needs.

## Contract deployment

To deploy the smart contracts to a network, replace _[networkName]_ in this command:

```bash
truffle migrate --network [networkName]
```

Networks can be configured in _truffle-config.js_. We've preconfigured the following:

- `development` (for local testing)
- `ethereum` (Ethereum Mainnet)
- `goerli` (Görli Ethereum Testnet)
- `kovan` (Kovan Ethereum Testnet)
- `rinkeby` (Rinkeby Ethereum Testnet)
- `ropsten` (Ropsten Ethereum Testnet)
- `bsc` (BNB Smart Chain)
- `bsctest` (BNB Smart Chain Testnet)
- `polygon` (Polygon Mainnet (formerly Matic))
- `mumbai` (Matic Mumbai Testnet)
- `gnosis` (Gnosis Chain (formerly xDai Chain))

### Note

The above procedure deploys all the contracts. If you want to deploy only specific contracts, you can run only the relevant script(s) via the below command:

```bash
truffle migrate -f [start] --to [end] --network [name]
```

Replace _[start]_ with the number of the first and _[end]_ with the number of the last migration script you wish to run. To run only one script, _[start]_ and _[end]_ should match. The numbers of the scripts are:

- 1 - Migrations
- 2 - FeeCollector

## Verification

For automatic verification you can use [truffle plugin verify](https://github.com/rkalis/truffle-plugin-verify).

```bash
truffle run verify [contractName] --network [networkName]
```

## Linting

The project uses [solhint](https://github.com/protofire/solhint). To run it, simply execute:

```bash
npm run lint
```

## Tests

To run the unit tests written for this project, execute this command in a terminal:

```bash
npm test
```

To run the unit tests only in a specific file, just append the path to the command. For example, to run tests just for MyContract:

```bash
npm test ./test/MyContractTest.js
```
