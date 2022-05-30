import 'dotenv/config';
import { BigNumber } from '@ethersproject/bignumber';
import { RSA } from 'node-rsa';
import { electionInterface, electionRegionInterface } from './jsonInterfaces';
import { regionData } from './region';
import { partyData } from './party';
import { createElection } from './createElection';
import { ballotObtention } from './ballotObtention';
import { results } from './results';
import { vote } from './vote';

const Web3 = require('web3');
const provider = process.env.WEB3_PROVIDER;
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(web3Provider);

const ownerAddress = process.env.WEB3_OWNER_ADDRESS;
const smartContractAddress = process.env.WEB3_SC_ADDRESS;
const electionContract = new web3.eth.Contract(electionInterface, smartContractAddress);

async function runElectionSimulation() {
	// First phase:  election creation and configuration
	const { parties, regions, key } = await createElection(web3, electionContract, partyData, regionData);

	// Wait until election starts
	const startTimestamp = await electionContract.methods
		.getStartTimestamp()
		.call();
	console.log(`\nWaiting for elections to start... (${Math.floor(startTimestamp - Date.now() / 1000)} seconds)`);
	await new Promise(resolve => {
		setTimeout(() => {
			console.log('Election started!\n');
			resolve();
		}, Math.floor(startTimestamp - Date.now() / 1000) * 1000);
	});

	// Second phase: voter authentication
	// This phase is not represented in code as it is done physically

	// Third phase: ballot obtention
	// Citizens pick their ballot from the ballot box and the manager register them in the system so they cannot pick another ballot
	await ballotObtention(web3, electionContract, regions);

	// Fourth phase: voting
	// All account addresses now cast their votes
	await vote(electionContract, regions, parties, key);

	// Fifth phase: results
	const electionResults = await results(electionContract, parties, regions, key);
	
	// Print results
	console.log(electionResults);
}

runElectionSimulation();

export { web3 };
