# 3PM Open Studio Smart Contract
​
## Introduction
This is a smart contract for 3PM Open Studio. It is written in Solidity and deployed on Polygon blockchain. The contract is used to manage the ownership of the music/ticket tokens and the royalty distribution.
​
## Installation
1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [Truffle](https://www.trufflesuite.com/docs/truffle/getting-started/installation)
3. Install [Ganache](https://www.trufflesuite.com/ganache)
4. Install [MetaMask](https://metamask.io/download.html)
​
​
## Usage
1. Clone the repository
2. Run `npm install` to install all the dependencies
3. Run `truffle compile` to compile the smart contract
4. Run `truffle migrate --network matic` to deploy the smart contract to Polygon blockchain
5. Run `truffle test` to run the test cases
​
## Test Cases
1. Test the change proxy address
2. Test for only or proxy can mint token
3. Test to mint a token and check the balance
4. Test for token holder can transfer their token and proxy can also
5. Test for approval token
6. Test for setURI (only owner)
7. Test for pause and unpause (only owner)
​
## Verify Code
1. First obtain polygon mainnet and mumbai testnet API keys from [PolygonScan](https://polygonscan.com/)
2. Run `truffle run verify ThreePMMusic --network matic` to verify the smart contract code on PolygonScan
​
## License
[MIT](https://choosealicense.com/licenses/mit/)
​
## Authors
3PM Inc. (https://3pm.earth)
