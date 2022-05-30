import { BigNumber } from '@ethersproject/bignumber';
import { web3 } from '.';

const createBigNumber = (option, parties) => {
  let binaryNumber = '';
  for(let i = 0; i < 256; i++) {
    binaryNumber += Math.floor(Math.random() * 2);
  }
  let greaterID = parties.reduce((max, party) => max = max > party.id ? max : party.id);
  let bn = BigNumber.from(binaryNumber.toString(16));
  while(!bn.mod(greaterID + 1).eq(option)) {
    bn = bn.add(1);
    if(bn.gt(BigNumber.from(2).pow(256))) bn = BigNumber.from(0);
  };
  return bn.toString();
};

const vote = async (electionContract, regions, parties, key) => {
  console.log('\n---------- VOTING ----------\n');
	for(let i = 0; i < regions.length; i++) {
    for(let j = 0; j < regions[i].voters.length; j++) {
			const chosenOption = Math.floor(Math.random() * parties.length);
      const bn = createBigNumber(parties[chosenOption].id, parties);
			const encryptedVote =  key.encrypt(bn, 'base64');
      await web3.eth.personal.unlockAccount(regions[i].voters[j], process.env.SIMULATION_ACCOUNTS_PASSWORD)
			await electionContract.methods
        .castVote(regions[i].id, encryptedVote)
        .send({from: regions[i].voters[j], gasPrice: 1});
			console.log(`Voter ${regions[i].voters[j]} has voted for option ${chosenOption} with the alternative number ${bn}. Encrypted vote results is: ${encryptedVote}`);
   }
  }
};

export { vote };
