const ethers = require("ethers");
const { BN, expectRevert } = require("@openzeppelin/test-helpers");
const expect = require("chai").expect;

const contractArtifact = artifacts.require("MyContract");

contract("MyContract", async function (accounts) {
  let contract;

  beforeEach("deploy a new contract", async function () {
    contract = await contractArtifact.new();
  });

  context("some context", async function () {
    it("should return the correct string", async function () {
      const result = await contract.hello();
      expect(result).to.equal("Hello friend");
    });
  });
});
