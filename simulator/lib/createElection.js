"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createElection = void 0;

const NodeRSA = require('node-rsa');

const ownerAddress = process.env.WEB3_OWNER_ADDRESS; // Add regions and census

const createRegions = async (electionContract, regionData) => {
  let regions = [];
  return await new Promise(async resolve => {
    for (let i = 0; i < regionData.length; i++) {
      const region = regionData[i];
      const receipt1 = await electionContract.methods.addRegion(region.name).send({
        from: ownerAddress
      });
      let regionID = receipt1.events.RegionCounterEvent.returnValues.regionID;
      await electionContract.methods.registerCitizenList(regionID, region.census).send({
        from: ownerAddress
      });
      const receipt2 = await electionContract.methods.getRegionById(regionID).send({
        from: ownerAddress
      });
      let address = receipt2.events.RegionAddressEvent.returnValues.regionAddress;
      console.log(address);
      regions.push({
        address: address,
        id: regionID,
        name: region.name,
        census: region.census,
        managers: [],
        voters: []
      });
      console.log('Region submitted: ');
      console.log(regions[i]);
    }

    ;
    resolve(regions);
  });
};

const createElection = async (web3, electionContract, partyData, regionData) => {
  console.log('\n---------- CREATE ELECTION ----------');
  console.log('\nSubmitting parties to blockchain...'); // Add parties

  var parties = [];

  for (let i = 0; i < partyData.length; i++) {
    const partyID = Math.floor(Math.random() * 1000001);
    const party = partyData[i];
    await electionContract.methods.addParty(partyID, party.name, party.list).send({
      from: ownerAddress
    });
    parties.push({
      id: partyID,
      name: party.name,
      list: party.list
    });
    console.log('Party submitted: ');
    console.log(parties[i]);
  }

  ;
  console.log('\nSubmitting regions to blockchain...');
  var regions = await createRegions(electionContract, regionData);
  console.log("\nCreating ".concat(process.env.SIMULATION_NUMBER_OF_MANAGERS_PER_REGION, " managers for each region...")); // Create manager accounts and distribute them equally among all regions

  var managers = [];

  for (let i = 0; i < regions.length; i++) {
    for (let j = 0; j < process.env.SIMULATION_NUMBER_OF_MANAGERS_PER_REGION; j++) {
      const managerAddress = await web3.eth.personal.newAccount(process.env.SIMULATION_ACCOUNTS_PASSWORD);
      web3.eth.personal.sendTransaction({
        from: process.env.WEB3_OWNER_ADDRESS,
        to: managerAddress,
        value: 1000000000
      }, process.env.SIMULATION_ADMIN_PASSWORD);
      regions[i].managers.push(managerAddress);
      console.log("Manager account '".concat(managerAddress, "' created for region ").concat(regions[i].name));
    }

    ;
    await electionContract.methods.addManagerListToRegion(regions[i].id, regions[i].managers).send({
      from: ownerAddress
    });
    console.log('Manager accounts submitted to blockchain');
  }

  ;
  console.log("\nCreating voters..."); // Create voter accounts and authorise as many of them as people is registered in the census of each region

  var voters = [];

  for (let i = 0; i < regions.length; i++) {
    for (let j = 0; j < regions[i].census.length; j++) {
      const voterAddress = await web3.eth.personal.newAccount(process.env.SIMULATION_ACCOUNTS_PASSWORD);
      web3.eth.personal.sendTransaction({
        from: process.env.WEB3_OWNER_ADDRESS,
        to: voterAddress,
        value: 1000000000
      }, process.env.SIMULATION_ADMIN_PASSWORD);
      regions[i].voters.push(voterAddress);
      console.log("Voter account '".concat(voterAddress, "' created for region ").concat(regions[i].name));
    }

    ;
    await electionContract.methods.authoriseVoterList(regions[i].id, regions[i].voters).send({
      from: ownerAddress
    });
    console.log('Voter accounts submitted to blockchain');
  } // Create common key for ballot encryption


  const key = new NodeRSA({
    b: 512
  });
  console.log('Created encryption key for votes');
  return {
    parties,
    regions,
    key
  };
};

exports.createElection = createElection;