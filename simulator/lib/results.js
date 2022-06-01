"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.results = void 0;

var _bignumber = require("@ethersproject/bignumber");

const results = async (electionContract, parties, regions, key) => {
  console.log('---------- RESULTS ----------');
  let results = {};
  parties.forEach(party => {
    results[party.id] = 0;
  });
  console.log('Results object initialised');
  let maxID = parties.reduce((max, party) => max = max > party.id ? max : party.id);

  for (let i = 0; i < regions.length; i++) {
    console.log('\t# Region ' + regions[i].name);
    const votes = await electionContract.methods.getAllVotesFromRegion(regions[i].id).call();
    console.log('\tEncrypted votes received:');

    for (let j = 0; j < votes.length; j++) {
      console.log("\t\t- Encrypted vote: ".concat(votes[i]));
      let vote = key.decrypt(votes[j], 'utf8');
      vote = _bignumber.BigNumber.from(vote).mod(maxID + 1);
      console.log("\t\t- Decrypted vote: ".concat(vote, "\n"));
      results[vote]++;
    }
  }

  return results;
};

exports.results = results;