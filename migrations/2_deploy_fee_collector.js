const guildFeeCollector = "0x..."; // The address that will receive Guild's share from the funds.
const guildSharex100 = 0; // The percentage of Guild's share multiplied by 100 (e.g 500 for a 5% cut).
const poapFeeCollector = "0x..."; // The address that will receive POAP's share from the funds.
const poapSharex100 = 0; // The percentage of POAP's share multiplied by 100 (e.g 500 for a 5% cut).

const FeeCollector = artifacts.require("FeeCollector");

module.exports = async (deployer) => {
  await deployer.deploy(FeeCollector, guildFeeCollector, guildSharex100, poapFeeCollector, poapSharex100);
};
