const {deployProxy, upgradeProxy} = require('@openzeppelin/truffle-upgrades');

const ThreePMMusic = artifacts.require("ThreePMMusic")

const baseUri = "https://api-studio-dev.3pm.link/v1/tokens/nft"
const baseContractUri = "https://api-studio-dev.3pm.link/v1/contract/3PM_MUSIC/metad"
const tokenName = "3PM_MUSIC"
const tokenSymbol = "3PM_MUSIC"

module.exports = async function (deployer) {

  const instance = await deployProxy(ThreePMMusic, 
    [baseUri, baseContractUri, tokenName, tokenSymbol], {deployer, initializer: 'initialize'})
  console.log('Deployed', instance.address)

};
