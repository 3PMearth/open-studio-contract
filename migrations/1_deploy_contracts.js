const {deployProxy, upgradeProxy} = require('@openzeppelin/truffle-upgrades');

const ThreePMMusic = artifacts.require("ThreePMMusic")

const baseUri = "https://api.com/3PM_MUSIC/token"
const baseContractUri = "https://api.com/3PM_MUSIC/contract-metadata"
const tokenName = "3PM_MUSIC"
const tokenSymbol = "3PM_MUSIC"

module.exports = async function (deployer) {

  const instance = await deployProxy(ThreePMMusic, 
    [baseUri, baseContractUri, tokenName, tokenSymbol], {deployer, initializer: 'initialize'})
  console.log('Deployed', instance.address)

};
