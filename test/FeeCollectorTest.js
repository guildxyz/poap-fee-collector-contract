const { balance, BN, constants, ether, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expectRevertCustomError } = require("custom-error-test-helper");
const expect = require("chai").expect;

const BadERC20 = artifacts.require("MockBadERC20");
const ERC20 = artifacts.require("MockERC20");
const FeeCollector = artifacts.require("FeeCollector");

function calculateFeeDistribution(collected, guildSharex100, poapSharex100) {
  const guildAmount = collected.mul(guildSharex100).div(new BN(10000));
  const poapAmount = collected.mul(poapSharex100).div(new BN(10000));
  const ownerAmount = collected.sub(poapAmount).sub(guildAmount);
  return { guildAmount, poapAmount, ownerAmount };
}

contract("FeeCollector", function (accounts) {
  const [wallet0, wallet1] = accounts;

  // Sample collector details
  const guildFeeCollector = accounts[2];
  const guildSharex100 = "469";
  const poapFeeCollector = accounts[3];
  const poapSharex100 = "500";

  // Sample vault details
  const eventId = "1";
  const owner = wallet1;
  const fee = ether("0.1");

  // Contract instances
  let token;
  let feeCollector;

  beforeEach("deploy a new contract", async function () {
    feeCollector = await FeeCollector.new(guildFeeCollector, guildSharex100, poapFeeCollector, poapSharex100);
    token = await ERC20.new();
  });

  context("creating a contract", async function () {
    it("should initialize fee collector addresses and fees", async function () {
      expect(await feeCollector.guildFeeCollector()).to.equal(guildFeeCollector);
      expect(await feeCollector.guildSharex100()).to.bignumber.equal(guildSharex100);
      expect(await feeCollector.poapFeeCollector()).to.equal(poapFeeCollector);
      expect(await feeCollector.poapSharex100()).to.bignumber.equal(poapSharex100);
    });
  });

  context("registering a vault", async function () {
    it("should store vault details", async function () {
      await feeCollector.registerVault(eventId, owner, token.address, fee);
      const vault = await feeCollector.getVault(0);
      expect(vault.eventId).to.bignumber.eq(eventId);
      expect(vault.owner).to.eq(owner);
      expect(vault.token).to.eq(token.address);
      expect(vault.fee).to.bignumber.eq(fee);
    });

    it("should emit a VaultRegistered event", async function () {
      const result = await feeCollector.registerVault(eventId, owner, token.address, fee);
      await expectEvent(result, "VaultRegistered", { vaultId: "0", eventId, owner, token: token.address, fee });
    });
  });

  context("paying fees", async function () {
    beforeEach("register an ERC20 and an Ether vault", async function () {
      await feeCollector.registerVault(eventId, owner, token.address, fee);
      await feeCollector.registerVault(eventId + 1, owner, constants.ZERO_ADDRESS, fee);
      await token.approve(feeCollector.address, constants.MAX_UINT256);
    });

    it("should revert if the vault does not exist", async function () {
      await expectRevertCustomError(FeeCollector, feeCollector.payFee("420"), "VaultDoesNotExist", [420]);
      await expectRevertCustomError(FeeCollector, feeCollector.payFee("69", { value: fee }), "VaultDoesNotExist", [69]);
    });

    it("should save the paid amount and set paid state for the account", async function () {
      const vaultDetails0 = await feeCollector.getVault("0");
      await feeCollector.payFee("0");
      const vaultDetails1 = await feeCollector.getVault("0");
      const hasPaid = await feeCollector.hasPaid("0", wallet0);
      expect(vaultDetails1.collected).to.bignumber.eq(vaultDetails0.collected.add(new BN(fee)));
      expect(hasPaid).to.be.true;

      const vaultDetails0a = await feeCollector.getVault("1");
      await feeCollector.payFee("1", { value: fee });
      const vaultDetails1a = await feeCollector.getVault("1");
      const hasPaida = await feeCollector.hasPaid("1", wallet0);
      expect(vaultDetails1a.collected).to.bignumber.eq(vaultDetails0a.collected.add(new BN(fee)));
      expect(hasPaida).to.be.true;
    });

    it("should accept Ether and transfer it", async function () {
      const tracker = await balance.tracker(feeCollector.address);
      await feeCollector.payFee("1", { value: fee });
      expect(await tracker.delta()).to.bignumber.eq(fee);
    });

    it("should revert if an Ether payment has the incorrect amount", async function () {
      await expectRevertCustomError(FeeCollector, feeCollector.payFee("1", { value: 42 }), "IncorrectFee", [
        1,
        42,
        fee
      ]);
      await expectRevertCustomError(FeeCollector, feeCollector.payFee("1"), "IncorrectFee", [1, 0, fee]);
    });

    it("should accept ERC20 and transfer it", async function () {
      const contractBalance0 = await token.balanceOf(feeCollector.address);
      const eoaBalance0 = await token.balanceOf(wallet0);
      await feeCollector.payFee("0");
      const contractBalance1 = await token.balanceOf(feeCollector.address);
      const eoaBalance1 = await token.balanceOf(wallet0);
      expect(contractBalance1).to.bignumber.eq(contractBalance0.add(new BN(fee)));
      expect(eoaBalance1).to.bignumber.eq(eoaBalance0.sub(new BN(fee)));
    });

    it("should revert if transaction value is non-zero when paying with ERC20", async function () {
      await expectRevertCustomError(
        FeeCollector,
        feeCollector.payFee("0", { value: 555 }),
        "IncorrectFee",
        [0, 555, 0]
      );
    });

    it("should revert if token transfer returns false", async function () {
      const badToken = await BadERC20.new();
      await feeCollector.registerVault(eventId + 2, owner, badToken.address, fee);
      await badToken.approve(feeCollector.address, constants.MAX_UINT256);
      await expectRevertCustomError(FeeCollector, feeCollector.payFee("2"), "TransferFailed", [
        wallet0,
        feeCollector.address
      ]);
    });

    it("should emit a FeeReceived event", async function () {
      const result = await feeCollector.payFee("0");
      await expectEvent(result, "FeeReceived", { vaultId: "0", account: wallet0, amount: fee });
    });
  });

  context("withdrawing collected fees", async function () {
    beforeEach("register an ERC20 and an Ether vault", async function () {
      await feeCollector.registerVault(eventId, owner, token.address, fee);
      await feeCollector.registerVault(eventId + 1, owner, constants.ZERO_ADDRESS, fee);
      await token.approve(feeCollector.address, constants.MAX_UINT256);
      await feeCollector.payFee("0");
      await feeCollector.payFee("1", { value: fee });
    });

    it("should revert if the vault does not exist", async function () {
      await expectRevert.unspecified(feeCollector.withdraw("42"));
    });

    it("should set the collected amount to zero", async function () {
      const vaultDetails0 = await feeCollector.getVault("0");
      await feeCollector.withdraw("0");
      const vaultDetails1 = await feeCollector.getVault("0");
      expect(vaultDetails0.collected).to.bignumber.not.eq("0");
      expect(vaultDetails1.collected).to.bignumber.eq("0");
    });

    it("should transfer Ether fees proportionately", async function () {
      const fees = calculateFeeDistribution(
        (await feeCollector.getVault("0")).collected,
        new BN(guildSharex100),
        new BN(poapSharex100)
      );

      const contractTracker = await balance.tracker(feeCollector.address);
      const guildFeeCollectorTracker = await balance.tracker(guildFeeCollector);
      const poapFeeCollectorTracker = await balance.tracker(poapFeeCollector);
      const ownerFeeCollectorTracker = await balance.tracker(owner);
      await feeCollector.withdraw("1");

      const bnFee = new BN(fee);
      expect(await contractTracker.delta()).to.bignumber.eq(bnFee.mul(new BN("-1")));
      expect(await guildFeeCollectorTracker.delta()).to.bignumber.eq(fees.guildAmount);
      expect(await poapFeeCollectorTracker.delta()).to.bignumber.eq(fees.poapAmount);
      expect(await ownerFeeCollectorTracker.delta()).to.bignumber.eq(fees.ownerAmount);
    });

    it("should transfer ERC20 fees proportionately", async function () {
      const collectedFees = (await feeCollector.getVault("0")).collected;
      const fees = calculateFeeDistribution(collectedFees, new BN(guildSharex100), new BN(poapSharex100));

      const contractBalance0 = await token.balanceOf(feeCollector.address);
      const guildFeeCollectorBalance0 = await token.balanceOf(guildFeeCollector);
      const poapFeeCollectorBalance0 = await token.balanceOf(poapFeeCollector);
      const ownerBalance0 = await token.balanceOf(owner);
      await feeCollector.withdraw("0");
      const contractBalance1 = await token.balanceOf(feeCollector.address);
      const guildFeeCollectorBalance1 = await token.balanceOf(guildFeeCollector);
      const poapFeeCollectorBalance1 = await token.balanceOf(poapFeeCollector);
      const ownerBalance1 = await token.balanceOf(owner);

      expect(contractBalance1).to.bignumber.eq(contractBalance0.sub(collectedFees));
      expect(guildFeeCollectorBalance1).to.bignumber.eq(guildFeeCollectorBalance0.add(fees.guildAmount));
      expect(poapFeeCollectorBalance1).to.bignumber.eq(poapFeeCollectorBalance0.add(fees.poapAmount));
      expect(ownerBalance1).to.bignumber.eq(ownerBalance0.add(fees.ownerAmount));
    });

    it("should emit a Withdrawn event", async function () {
      const fees = calculateFeeDistribution(
        (await feeCollector.getVault("0")).collected,
        new BN(guildSharex100),
        new BN(poapSharex100)
      );

      const result = await feeCollector.withdraw("0");
      await expectEvent(result, "Withdrawn", {
        vaultId: "0",
        guildAmount: fees.guildAmount,
        poapAmount: fees.poapAmount,
        ownerAmount: fees.ownerAmount
      });
    });
  });

  context("setting fee collectors and their share", async function () {
    context("Guild's fee collector", async function () {
      it("should revert if it's attempted to be changed by anyone else", async function () {
        await expectRevertCustomError(FeeCollector, feeCollector.setGuildFeeCollector(accounts[5]), "AccessDenied", [
          wallet0,
          guildFeeCollector
        ]);
      });

      it("should change the address", async function () {
        await feeCollector.setGuildFeeCollector(accounts[5], { from: guildFeeCollector });
        const newAddress = await feeCollector.guildFeeCollector();
        expect(newAddress).to.eq(accounts[5]);
      });

      it("should emit a GuildFeeCollectorChanged event", async function () {
        const result = await feeCollector.setGuildFeeCollector(accounts[5], { from: guildFeeCollector });
        await expectEvent(result, "GuildFeeCollectorChanged", { newFeeCollector: accounts[5] });
      });
    });

    context("Guild's share", async function () {
      it("should revert if it's attempted to be changed by anyone else", async function () {
        await expectRevertCustomError(FeeCollector, feeCollector.setGuildSharex100("100"), "AccessDenied", [
          wallet0,
          guildFeeCollector
        ]);
      });

      it("should change the value", async function () {
        await feeCollector.setGuildSharex100("100", { from: guildFeeCollector });
        const newValue = await feeCollector.guildSharex100();
        expect(newValue).to.bignumber.eq("100");
      });

      it("should emit a GuildSharex100Changed event", async function () {
        const result = await feeCollector.setGuildSharex100("100", { from: guildFeeCollector });
        await expectEvent(result, "GuildSharex100Changed", { newShare: "100" });
      });
    });

    context("Poap's fee collector", async function () {
      it("should revert if it's attempted to be changed by anyone else", async function () {
        await expectRevertCustomError(FeeCollector, feeCollector.setPoapFeeCollector(accounts[5]), "AccessDenied", [
          wallet0,
          poapFeeCollector
        ]);
      });

      it("should change the address", async function () {
        await feeCollector.setPoapFeeCollector(accounts[5], { from: poapFeeCollector });
        const newAddress = await feeCollector.poapFeeCollector();
        expect(newAddress).to.eq(accounts[5]);
      });

      it("should emit a PoapFeeCollectorChanged event", async function () {
        const result = await feeCollector.setPoapFeeCollector(accounts[5], { from: poapFeeCollector });
        await expectEvent(result, "PoapFeeCollectorChanged", { newFeeCollector: accounts[5] });
      });
    });

    context("Poap's share", async function () {
      it("should revert if it's attempted to be changed by anyone else", async function () {
        await expectRevertCustomError(FeeCollector, feeCollector.setPoapSharex100("100"), "AccessDenied", [
          wallet0,
          poapFeeCollector
        ]);
      });

      it("should change the value", async function () {
        await feeCollector.setPoapSharex100("100", { from: poapFeeCollector });
        const newValue = await feeCollector.poapSharex100();
        expect(newValue).to.bignumber.eq("100");
      });

      it("should emit a PoapSharex100Changed event", async function () {
        const result = await feeCollector.setPoapSharex100("100", { from: poapFeeCollector });
        await expectEvent(result, "PoapSharex100Changed", { newShare: "100" });
      });
    });
  });
});
