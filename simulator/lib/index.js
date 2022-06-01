"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.web3 = void 0;

require("dotenv/config");

var _bignumber = require("@ethersproject/bignumber");

var _nodeRsa = require("node-rsa");

var _jsonInterfaces = require("./jsonInterfaces");

var _region = require("./region");

var _party = require("./party");

var _createElection = require("./createElection");

var _ballotObtention = require("./ballotObtention");

var _results = require("./results");

var _vote = require("./vote");

const Web3 = require('web3');

const provider = process.env.WEB3_PROVIDER;
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(web3Provider);
exports.web3 = web3;
const smartContractAddress = process.env.WEB3_SC_ADDRESS;
const electionContract = new web3.eth.Contract(_jsonInterfaces.electionInterface, smartContractAddress);

async function runElectionSimulation() {
  // First phase:  election creation and configuration
  const {
    parties,
    regions,
    key
  } = await (0, _createElection.createElection)(web3, electionContract, _party.partyData, _region.regionData); // Wait until election starts

  const startTimestamp = await electionContract.methods.getStartTimestamp().call();
  console.log("\nWaiting for elections to start... (".concat(Math.floor(startTimestamp - Date.now() / 1000), " seconds)"));
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('Election started!\n');
      resolve();
    }, Math.floor(startTimestamp - Date.now() / 1000 + 1) * 1000);
  }); // Second phase: voter authentication
  // This phase is not represented in code as it is done physically
  // Third phase: ballot obtention
  // Citizens pick their ballot from the ballot box and the manager register them in the system so they cannot pick another ballot

  await (0, _ballotObtention.ballotObtention)(web3, electionContract, regions); // Fourth phase: voting
  // All account addresses now cast their votes

  await (0, _vote.vote)(electionContract, regions, parties, key); // Wait until election ends

  const endTimestamp = await electionContract.methods.getEndTimestamp().call();
  console.log("\nWaiting for elections to end... (".concat(Math.floor(endTimestamp - Date.now() / 1000), " seconds)"));
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('Election ended!\n');
      resolve();
    }, Math.floor(endTimestamp - Date.now() / 1000 + 1) * 1000);
  }); // Fifth phase: results

  const electionResults = await (0, _results.results)(electionContract, parties, regions, key); // Print results

  console.log(electionResults);
}

runElectionSimulation();