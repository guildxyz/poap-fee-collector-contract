import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

function calculateFeeDistribution(collected: BigNumber, guildSharex100: BigNumber, poapSharex100: BigNumber) {
  const guildAmount = collected.mul(guildSharex100).div(10000);
  const poapAmount = collected.mul(poapSharex100).div(10000);
  const ownerAmount = collected.sub(poapAmount).sub(guildAmount);
  return { guildAmount, poapAmount, ownerAmount };
}

// Test accounts
let wallet0: SignerWithAddress;
let owner: SignerWithAddress;
let randomWallet: SignerWithAddress;

// Sample collector details
let guildFeeCollector: SignerWithAddress;
const guildSharex100 = BigNumber.from(469);
let poapFeeCollector: SignerWithAddress;
const poapSharex100 = BigNumber.from("500");

// Sample vault details
const eventId = "1";
const fee = ethers.utils.parseEther("0.1");

// Contract instances
let token: Contract;
let feeCollector: Contract;

describe("FeeCollector", function () {
  this.beforeAll("deploy contracts", async () => {
    [wallet0, owner, guildFeeCollector, poapFeeCollector, randomWallet] = await ethers.getSigners();
  });

  this.beforeEach("deploy new contracts", async () => {
    const FeeCollector = await ethers.getContractFactory("FeeCollector");
    feeCollector = await FeeCollector.deploy(
      guildFeeCollector.address,
      guildSharex100,
      poapFeeCollector.address,
      poapSharex100
    );

    const ERC20 = await ethers.getContractFactory("MockERC20");
    token = await ERC20.deploy();
  });

  context("creating a contract", async () => {
    it("should initialize fee collector addresses and fees", async () => {
      expect(await feeCollector.guildFeeCollector()).to.equal(guildFeeCollector.address);
      expect(await feeCollector.guildSharex100()).to.equal(guildSharex100);
      expect(await feeCollector.poapFeeCollector()).to.equal(poapFeeCollector.address);
      expect(await feeCollector.poapSharex100()).to.equal(poapSharex100);
    });
  });

  context("registering a vault", async () => {
    it("should store vault details", async () => {
      await feeCollector.registerVault(eventId, owner.address, token.address, fee);
      const vault = await feeCollector.getVault(0);
      expect(vault.eventId).to.eq(eventId);
      expect(vault.owner).to.eq(owner.address);
      expect(vault.token).to.eq(token.address);
      expect(vault.fee).to.eq(fee);
    });

    it("should emit a VaultRegistered event", async () => {
      const tx = feeCollector.registerVault(eventId, owner.address, token.address, fee);
      await expect(tx)
        .to.emit(feeCollector, "VaultRegistered")
        .withArgs("0", eventId, owner.address, token.address, fee);
    });
  });

  context("paying fees", async () => {
    beforeEach("register an ERC20 and an Ether vault", async () => {
      await feeCollector.registerVault(eventId, owner.address, token.address, fee);
      await feeCollector.registerVault(eventId + 1, owner.address, ethers.constants.AddressZero, fee);
      await token.approve(feeCollector.address, ethers.constants.MaxUint256);
    });

    it("should revert if the vault does not exist", async () => {
      await expect(feeCollector.payFee("420"))
        .to.be.revertedWithCustomError(feeCollector, "VaultDoesNotExist")
        .withArgs(420);
      await expect(feeCollector.payFee("69", { value: fee }))
        .to.be.revertedWithCustomError(feeCollector, "VaultDoesNotExist")
        .withArgs(69);
    });

    it("should save the paid amount and set paid state for the account", async () => {
      const vaultDetails0 = await feeCollector.getVault("0");
      await feeCollector.payFee("0");
      const vaultDetails1 = await feeCollector.getVault("0");
      const hasPaid = await feeCollector.hasPaid("0", wallet0.address);
      expect(vaultDetails1.collected).to.eq(vaultDetails0.collected.add(fee));
      expect(hasPaid).to.eq(true);

      const vaultDetails0a = await feeCollector.getVault("1");
      await feeCollector.payFee("1", { value: fee });
      const vaultDetails1a = await feeCollector.getVault("1");
      const hasPaida = await feeCollector.hasPaid("1", wallet0.address);
      expect(vaultDetails1a.collected).to.eq(vaultDetails0a.collected.add(fee));
      expect(hasPaida).to.eq(true);
    });

    it("should accept Ether and transfer it", async () => {
      const oldBalance = await ethers.provider.getBalance(feeCollector.address);
      await feeCollector.payFee("1", { value: fee });
      const newBalance = await ethers.provider.getBalance(feeCollector.address);
      expect(newBalance.sub(oldBalance)).to.eq(fee);
    });

    it("should revert if an Ether payment has the incorrect amount", async () => {
      await expect(feeCollector.payFee("1", { value: 42 }))
        .to.be.revertedWithCustomError(feeCollector, "IncorrectFee")
        .withArgs(1, 42, fee);
      await expect(feeCollector.payFee("1"))
        .to.be.revertedWithCustomError(feeCollector, "IncorrectFee")
        .withArgs(1, 0, fee);
    });

    it("should accept ERC20 and transfer it", async () => {
      const contractBalance0 = await token.balanceOf(feeCollector.address);
      const eoaBalance0 = await token.balanceOf(wallet0.address);
      await feeCollector.payFee("0");
      const contractBalance1 = await token.balanceOf(feeCollector.address);
      const eoaBalance1 = await token.balanceOf(wallet0.address);
      expect(contractBalance1).to.eq(contractBalance0.add(fee));
      expect(eoaBalance1).to.eq(eoaBalance0.sub(fee));
    });

    it("should revert if transaction value is non-zero when paying with ERC20", async () => {
      await expect(feeCollector.payFee("0", { value: 555 }))
        .to.be.revertedWithCustomError(feeCollector, "IncorrectFee")
        .withArgs(0, 555, 0);
    });

    it("should revert if token transfer returns false", async () => {
      const BadERC20 = await ethers.getContractFactory("MockBadERC20");
      const badToken = await BadERC20.deploy();
      await feeCollector.registerVault(eventId + 2, owner.address, badToken.address, fee);
      await badToken.approve(feeCollector.address, ethers.constants.MaxUint256);
      await expect(feeCollector.payFee("2"))
        .to.be.revertedWithCustomError(feeCollector, "TransferFailed")
        .withArgs(wallet0.address, feeCollector.address);
    });

    it("should emit a FeeReceived event", async () => {
      const tx = feeCollector.payFee("0");
      await expect(tx).to.emit(feeCollector, "FeeReceived").withArgs("0", wallet0.address, fee);
    });
  });

  context("withdrawing collected fees", async () => {
    beforeEach("register an ERC20 and an Ether vault", async () => {
      await feeCollector.registerVault(eventId, owner.address, token.address, fee);
      await feeCollector.registerVault(eventId + 1, owner.address, ethers.constants.AddressZero, fee);
      await token.approve(feeCollector.address, ethers.constants.MaxUint256);
      await feeCollector.payFee("0");
      await feeCollector.payFee("1", { value: fee });
    });

    it("should revert if the vault does not exist", async () => {
      await expect(feeCollector.withdraw("42"))
        .to.be.revertedWithCustomError(feeCollector, "VaultDoesNotExist")
        .withArgs(42);
    });

    it("should set the collected amount to zero", async () => {
      const vaultDetails0 = await feeCollector.getVault("0");
      await feeCollector.withdraw("0");
      const vaultDetails1 = await feeCollector.getVault("0");
      expect(vaultDetails0.collected).to.not.eq("0");
      expect(vaultDetails1.collected).to.eq("0");
    });

    it("should transfer Ether fees proportionately", async () => {
      const fees = calculateFeeDistribution(
        (await feeCollector.getVault("0")).collected,
        guildSharex100,
        poapSharex100
      );

      const oldContractBalance = await ethers.provider.getBalance(feeCollector.address);
      const oldGuildFeeCollectorBalance = await ethers.provider.getBalance(guildFeeCollector.address);
      const oldPoapFeeCollectorBalance = await ethers.provider.getBalance(poapFeeCollector.address);
      const OldOwnerFeeCollectorBalance = await ethers.provider.getBalance(owner.address);
      await feeCollector.withdraw("1");
      const newContractBalance = await ethers.provider.getBalance(feeCollector.address);
      const newGuildFeeCollectorBalance = await ethers.provider.getBalance(guildFeeCollector.address);
      const newPoapFeeCollectorBalance = await ethers.provider.getBalance(poapFeeCollector.address);
      const newOwnerFeeCollectorBalance = await ethers.provider.getBalance(owner.address);

      expect(oldContractBalance.sub(newContractBalance)).to.eq(fee);
      expect(newGuildFeeCollectorBalance.sub(oldGuildFeeCollectorBalance)).to.eq(fees.guildAmount);
      expect(newPoapFeeCollectorBalance.sub(oldPoapFeeCollectorBalance)).to.eq(fees.poapAmount);
      expect(newOwnerFeeCollectorBalance.sub(OldOwnerFeeCollectorBalance)).to.eq(fees.ownerAmount);
    });

    it("should transfer ERC20 fees proportionately", async () => {
      const collectedFees = (await feeCollector.getVault("0")).collected;
      const fees = calculateFeeDistribution(collectedFees, guildSharex100, poapSharex100);

      const contractBalance0 = await token.balanceOf(feeCollector.address);
      const guildFeeCollectorBalance0 = await token.balanceOf(guildFeeCollector.address);
      const poapFeeCollectorBalance0 = await token.balanceOf(poapFeeCollector.address);
      const ownerBalance0 = await token.balanceOf(owner.address);
      await feeCollector.withdraw("0");
      const contractBalance1 = await token.balanceOf(feeCollector.address);
      const guildFeeCollectorBalance1 = await token.balanceOf(guildFeeCollector.address);
      const poapFeeCollectorBalance1 = await token.balanceOf(poapFeeCollector.address);
      const ownerBalance1 = await token.balanceOf(owner.address);

      expect(contractBalance1).to.eq(contractBalance0.sub(collectedFees));
      expect(guildFeeCollectorBalance1).to.eq(guildFeeCollectorBalance0.add(fees.guildAmount));
      expect(poapFeeCollectorBalance1).to.eq(poapFeeCollectorBalance0.add(fees.poapAmount));
      expect(ownerBalance1).to.eq(ownerBalance0.add(fees.ownerAmount));
    });

    it("should emit a Withdrawn event", async () => {
      const fees = calculateFeeDistribution(
        (await feeCollector.getVault("0")).collected,
        guildSharex100,
        poapSharex100
      );

      const tx = feeCollector.withdraw("0");
      await expect(tx)
        .to.emit(feeCollector, "Withdrawn")
        .withArgs("0", fees.guildAmount, fees.poapAmount, fees.ownerAmount);
    });
  });

  context("setting fee collectors and their share", async () => {
    context("Guild's fee collector", async () => {
      it("should revert if it's attempted to be changed by anyone else", async () => {
        await expect(feeCollector.setGuildFeeCollector(randomWallet.address))
          .to.be.revertedWithCustomError(feeCollector, "AccessDenied")
          .withArgs(wallet0.address, guildFeeCollector.address);
      });

      it("should change the address", async () => {
        await feeCollector.connect(guildFeeCollector).setGuildFeeCollector(randomWallet.address);
        const newAddress = await feeCollector.guildFeeCollector();
        expect(newAddress).to.eq(randomWallet.address);
      });

      it("should emit a GuildFeeCollectorChanged event", async () => {
        const tx = feeCollector.connect(guildFeeCollector).setGuildFeeCollector(randomWallet.address);
        await expect(tx).to.emit(feeCollector, "GuildFeeCollectorChanged").withArgs(randomWallet.address);
      });
    });

    context("Guild's share", async () => {
      it("should revert if it's attempted to be changed by anyone else", async () => {
        await expect(feeCollector.setGuildSharex100("100"))
          .to.be.revertedWithCustomError(feeCollector, "AccessDenied")
          .withArgs(wallet0.address, guildFeeCollector.address);
      });

      it("should change the value", async () => {
        await feeCollector.connect(guildFeeCollector).setGuildSharex100("100");
        const newValue = await feeCollector.guildSharex100();
        expect(newValue).to.eq("100");
      });

      it("should emit a GuildSharex100Changed event", async () => {
        const tx = feeCollector.connect(guildFeeCollector).setGuildSharex100("100");
        await expect(tx).to.emit(feeCollector, "GuildSharex100Changed").withArgs("100");
      });
    });

    context("Poap's fee collector", async () => {
      it("should revert if it's attempted to be changed by anyone else", async () => {
        await expect(feeCollector.setPoapFeeCollector(randomWallet.address))
          .to.be.revertedWithCustomError(feeCollector, "AccessDenied")
          .withArgs(wallet0.address, poapFeeCollector.address);
      });

      it("should change the address", async () => {
        await feeCollector.connect(poapFeeCollector).setPoapFeeCollector(randomWallet.address);
        const newAddress = await feeCollector.poapFeeCollector();
        expect(newAddress).to.eq(randomWallet.address);
      });

      it("should emit a PoapFeeCollectorChanged event", async () => {
        const tx = feeCollector.connect(poapFeeCollector).setPoapFeeCollector(randomWallet.address);
        await expect(tx).to.emit(feeCollector, "PoapFeeCollectorChanged").withArgs(randomWallet.address);
      });
    });

    context("Poap's share", async () => {
      it("should revert if it's attempted to be changed by anyone else", async () => {
        await expect(feeCollector.setPoapSharex100("100"))
          .to.be.revertedWithCustomError(feeCollector, "AccessDenied")
          .withArgs(wallet0.address, poapFeeCollector.address);
      });

      it("should change the value", async () => {
        await feeCollector.connect(poapFeeCollector).setPoapSharex100("100");
        const newValue = await feeCollector.poapSharex100();
        expect(newValue).to.eq("100");
      });

      it("should emit a PoapSharex100Changed event", async () => {
        const tx = feeCollector.connect(poapFeeCollector).setPoapSharex100("100");
        await expect(tx).to.emit(feeCollector, "PoapSharex100Changed").withArgs("100");
      });
    });
  });
});
