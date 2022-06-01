"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ballotObtention = void 0;

var _jsonInterfaces = require("./jsonInterfaces");

/* Simulate that each citizen in each region has obtained his/her vote */
const ballotObtention = async (web3, electionContract, regions) => {
  console.log('\n---------- BALLOT OBTENTION ----------\n');

  for (let i = 0; i < regions.length; i++) {
    for (let j = 0; j < regions[i].census.length; j++) {
      await web3.eth.personal.unlockAccount(regions[i].managers[0], process.env.SIMULATION_ACCOUNTS_PASSWORD);
      await electionContract.methods.citizenObtainedVote(regions[i].id, regions[i].census[j]).send({
        from: regions[i].managers[0],
        gasPrice: 1
      });
      console.log("Citizen ".concat(regions[i].census[j], " in region ").concat(regions[i].name, " obtained a ballot"));
    }

    ;
  }

  ;
};

exports.ballotObtention = ballotObtention;