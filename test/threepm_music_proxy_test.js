const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { ASSERT_EQ, EXPECT_EXCEPT, EXPECT_NOEXCEPT } = require('./helpers/assertion');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const toBN = web3.utils.toBN;
const ethers = require('ethers')

const baseUri = "https://api.com/3PM_MUSIC/token"
const baseContractUri = "https://api.com/3PM_MUSIC/contract-metadata"
const tokenName = "3PM_MUSIC"
const tokenSymbol = "3PM_MUSIC"

const ThreePMMusic = artifacts.require("ThreePMMusic");

contract("ThreePMMusic Test (Proxy)", function (accounts) {
    beforeEach(async () => {
        instance = await deployProxy(ThreePMMusic, 
            [baseUri, baseContractUri, tokenName, tokenSymbol], {initializer: 'initialize'});
    });


    const ownerAddress = accounts[0];
    const otherAddress = accounts[1];
    const holderAddress = accounts[2];
    const receiverAddress = accounts[3];
    const newProxyAddress = accounts[5];
    const user1 = accounts[6];
    const user2 = accounts[7];
    const approvedUser = accounts[8];

    console.log("----------------------------------------------");
    console.log("ownerAddress : " + ownerAddress);
    console.log("defaultProxyAddress : " + ownerAddress);
    console.log("----------------------------------------------");

    it('change proxy address', async () =>
    {
        let result = await instance.getProxy();
        //change address
        result = await instance.setProxy(newProxyAddress, {from:ownerAddress});
        result = await instance.getProxy();
        console.log("proxy address (newProxyAddress) : " + newProxyAddress);
        console.log("proxy address (result) : " + result);
        assert.equal(result, newProxyAddress, "the proxy address should be changed");
    })

    
    it('only owner or proxy can mint token', async () =>
    {
        let tokenId = 11;
        await EXPECT_EXCEPT("revert", instance.mintMultiToken.call(holderAddress, tokenId, 1, {from:otherAddress}));
        
        //can mint by proxy address
        let proxyAddress = await instance.getProxy();
        console.log("proxy address : " + proxyAddress);
        result = await instance.mintMultiToken(holderAddress, tokenId, 3, {from:proxyAddress});
        let balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 3, "Token balance should be 3");

        //mint by owner
/*         result = await instance.mintMultiToken(holderAddress, tokenId, 5, {from:ownerAddress});
        balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 8, "Token balance should be 8"); */
    })  

    
   it('mint a token and check the balance', async () =>
    {
        let tokenId = 1;
        let result = await instance.mintMultiToken(holderAddress, tokenId, 1);
        let balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 1, "Token balance should be 1");

        tokenId = 2;
        result = await instance.mintMultiToken(holderAddress, tokenId, 100);
        balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 100, "Token balance should be 100");        
    })  

    it('token holder can transfer their token and proxy can also', async () => 
    {
        let tokenId = 1
        let result = await instance.mintMultiToken(holderAddress, tokenId, 1, {from:ownerAddress});
        result = await instance.safeTransferFrom(holderAddress, user1, tokenId, 1, 0x00, {from: holderAddress});
        //user1 should have 1 token
        let currentProxyAddress = await instance.getProxy();
        let balance = await instance.balanceOf.call(user1, tokenId);
        assert.equal(balance, 1, "Token balance should be 1");
        //revert ERC1155: caller is not owner nor approved
        await EXPECT_EXCEPT("revert", instance.safeTransferFrom(user1, user2, tokenId, 1, 0x00, {from: holderAddress}));
        //proxy can transfer
        result = await instance.safeTransferFrom(user1, user2, tokenId, 1, 0x00, {from: currentProxyAddress});
        balance = await instance.balanceOf.call(user2, tokenId);
        assert.equal(balance, 1, "Token balance should be 1");
    })

    //mint -> approval -> transfer to user by approved address -> transfer by owner/proxy
    it('approval test', async () => {
        let tokenId = 2;
        let result = await instance.mintMultiToken(holderAddress, tokenId, 100, {from:ownerAddress});
        let balance = await instance.balanceOf.call(holderAddress, tokenId);
        console.log("balance : " + balance);
        result = await instance.setApprovalForAll(approvedUser, 1, {from:holderAddress});
        result = await instance.safeTransferFrom(holderAddress, user2, tokenId, 5, 0x00, {from:approvedUser});
        balance = await instance.balanceOf.call(user2, tokenId);
        assert.equal(balance, 5, "Token balance should be 5");
        //transfer again
        //revert ERC1155: caller is not owner nor approve
        let currentProxyAddress = await instance.getProxy();
        await EXPECT_EXCEPT("revert", instance.safeTransferFrom(user2, user1, tokenId, 3, 0x00, {from:approvedUser}));
        result = await instance.safeTransferFrom(user2, user1, tokenId, 3, 0x00, {from:currentProxyAddress});
        balance = await instance.balanceOf.call(user2, tokenId);
        assert.equal(balance, 2, "Token balance should be 2");
    })

    
    it('setURI test (only for Owner)', async () => {
        let newURI = "https://flask-heroku-api-test1.herokuapp.com/token";
        let result = await instance.setBaseTokenURI(newURI);
        //check URI
        let tokenId = 1;
        let tokenURI = await instance.uri(tokenId);
        //console.log("-->" + tokenURI);
        assert.equal(tokenURI, newURI + "/" + tokenId, "new URI should be set");
    })

    it('token uri test', async () => {
        let tokenId = 1;
        let result = await instance.mintMultiToken(holderAddress, tokenId, 1);
        let tokenURI = await instance.uri(tokenId);
        assert.equal(tokenURI, baseUri + "/" + tokenId, "token URI should be set");
    })

    it('token contract uri test', async () => {
        let result = await instance.setBaseContractURI(baseContractUri);
        let contractURI = await instance.contractURI();
        assert.equal(contractURI, baseContractUri, "contract URI should be set");
    })

    it('pause test (only for Owner)', async () => {
        let tokenId = 12;
        let result = await instance.mintMultiToken(holderAddress, tokenId, 3);
        let balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 3, "Token balance should be 3");
        //sent token
        result = await instance.safeTransferFrom(holderAddress, receiverAddress, tokenId, 1, 0x00, {from: holderAddress});
        balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 2, "Token balance should be 2");
        balance = await instance.balanceOf.call(receiverAddress, tokenId);
        assert.equal(balance, 1, "Token balance should be 1");
        //pause
        //result = await instance.pauseToken()
        //result = await instance.safeTransferFrom(holderAddress, receiverAddress, tokenId, 1, 0x00, {from: holderAddress});
    })

    it('changeAmount function test (only for Owner and Creator)', async () => {
        //mint first
        let tokenId = 13;
        let result = await instance.mintMultiToken(holderAddress, tokenId, 3);
        let balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 3, "Token balance should be 3");
        //change amount
        result = await instance.changeAmount(holderAddress, tokenId, 2);
        balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 2, "Token balance should be 2");
        //change amount by creator
        let creatorAddress = await instance.getCreator(tokenId);
        result = await instance.changeAmount(holderAddress, tokenId, 1, {from:creatorAddress});
        balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 1, "Token balance should be 1");
        //change amount by other
        await EXPECT_EXCEPT("revert", instance.changeAmount(holderAddress, tokenId, 1, {from:user1}));
        //amount 0 is not allowed
        await EXPECT_EXCEPT("revert", instance.changeAmount(holderAddress, tokenId, 0));


    })

});
