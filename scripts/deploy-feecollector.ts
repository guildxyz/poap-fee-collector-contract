import { ethers } from "hardhat";

// Constructor arguments
const guildFeeCollector = "0x..."; // The address that will receive Guild's share from the funds.
const guildSharex100 = 0; // The percentage of Guild's share multiplied by 100 (e.g 500 for a 5% cut).
const poapFeeCollector = "0x..."; // The address that will receive POAP's share from the funds.
const poapSharex100 = 0; // The percentage of POAP's share multiplied by 100 (e.g 500 for a 5% cut).

async function main() {
  const FeeCollector = await ethers.getContractFactory("FeeCollector");

  console.log(
    `Deploying contract to ${
      ethers.provider.network.name !== "unknown" ? ethers.provider.network.name : ethers.provider.network.chainId
    }...`
  );

  const feeCollector = await FeeCollector.deploy(guildFeeCollector, guildSharex100, poapFeeCollector, poapSharex100);
  await feeCollector.deployed();

  console.log("FeeCollector deployed to:", feeCollector.address);
  console.log("Constructor arguments:", guildFeeCollector, guildSharex100, poapFeeCollector, poapSharex100);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
