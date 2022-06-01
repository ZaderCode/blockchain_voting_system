"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vote = void 0;

var _bignumber = require("@ethersproject/bignumber");

var _ = require(".");

const createBigNumber = (option, parties) => {
  let hexNumber = '0x';

  for (let i = 0; i < 64; i++) {
    hexNumber += parseInt(Math.floor(Math.random() * 16)).toString(16);
  }

  let greatestID = parties.reduce((max, party) => max = max > party.id ? max : party.id);

  let bn = _bignumber.BigNumber.from(hexNumber);

  while (!bn.mod(greatestID + 1).eq(option)) {
    bn = bn.add(1);
    if (bn.gt(_bignumber.BigNumber.from(2).pow(256))) bn = _bignumber.BigNumber.from(0);
  }

  ;
  console.log(bn);
  return bn;
};

const vote = async (electionContract, regions, parties, key) => {
  console.log('\n---------- VOTING ----------\n');

  for (let i = 0; i < regions.length; i++) {
    for (let j = 0; j < regions[i].voters.length; j++) {
      const chosenOption = Math.floor(Math.random() * parties.length);
      const bn = createBigNumber(parties[chosenOption].id, parties);
      const encryptedVote = key.encrypt(bn, 'base64');
      await _.web3.eth.personal.unlockAccount(regions[i].voters[j], process.env.SIMULATION_ACCOUNTS_PASSWORD);
      await electionContract.methods.castVote(regions[i].id, encryptedVote).send({
        from: regions[i].voters[j],
        gasPrice: 1
      });
      console.log("Voter ".concat(regions[i].voters[j], " has voted for option ").concat(parties[chosenOption].id, " with the alternative number ").concat(bn, ". Encrypted vote results is: ").concat(encryptedVote));
    }
  }
};

exports.vote = vote;