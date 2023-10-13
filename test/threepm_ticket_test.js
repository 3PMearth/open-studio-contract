const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { ASSERT_EQ, EXPECT_EXCEPT, EXPECT_NOEXCEPT } = require('./helpers/assertion');
​
​
const toBN = web3.utils.toBN;
const ethers = require('ethers')
​
​
const ThreePMTicket = artifacts.require("ThreePMTicket");
​
contract("ThreePMTicket Test", function (accounts) {
    beforeEach(async () => {
        instance = await ThreePMTicket.deployed();
    });
​
    const ownerAddress = accounts[0];
    const otherAddress = accounts[1];
    const holderAddress = accounts[2];
    const receiverAddress = accounts[3];
    const newMinterAddress = accounts[4];
    const newProxyAddress = accounts[5];
    const user1 = accounts[6];
    const user2 = accounts[7];
    const approvedUser = accounts[8];
​
    console.log("----------------------------------------------");
    console.log("ownerAddress : " + ownerAddress);
    console.log("newMinterAddress : " + newMinterAddress);
    console.log("defaultProxyAddress : " + ownerAddress);
    console.log("----------------------------------------------");
​
    it('change proxy address', async () =>
    {
        let result = await instance.getProxy();
        //change address
        result = await instance.setProxy(newProxyAddress, {from:ownerAddress});
        result = await instance.getProxy();
        assert.equal(result, newProxyAddress, "the proxy address should be changed");
    })
​
    
    it('only owner or proxy can mint token', async () =>
    {
        let tokenId = 11;
        await EXPECT_EXCEPT("revert", instance.mintMultiToken.call(holderAddress, tokenId, 1, {from:otherAddress}));
        
        //can mint by proxy address
        result = await instance.mintMultiToken(holderAddress, tokenId, 3, {from:newProxyAddress});
        let balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 3, "Token balance should be 3");
​
        //mint by owner
        result = await instance.mintMultiToken(holderAddress, tokenId, 5, {from:ownerAddress});
        balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 8, "Token balance should be 8");
    })  
​
    
   it('mint a token and check the balance', async () =>
    {
        let tokenId = 1;
        let result = await instance.mintMultiToken(holderAddress, tokenId, 1);
        let balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 1, "Token balance should be 1");
​
        tokenId = 2;
        result = await instance.mintMultiToken(holderAddress, tokenId, 100);
        balance = await instance.balanceOf.call(holderAddress, tokenId);
        assert.equal(balance, 100, "Token balance should be 100");        
    })  
​
    it('token holder can transfer their token and proxy can also', async () => 
    {
        let tokenId = 1
        let result = await instance.safeTransferFrom(holderAddress, user1, tokenId, 1, 0x00, {from: holderAddress});
        //user1 should have 1 token
        let currentProxyAddress = await instance.getProxy.call();
        let balance = await instance.balanceOf.call(user1, tokenId);
        assert.equal(balance, 1, "Token balance should be 1");
        //revert ERC1155: caller is not owner nor approved
        await EXPECT_EXCEPT("revert", instance.safeTransferFrom(user1, user2, tokenId, 1, 0x00, {from: holderAddress}));
        await EXPECT_EXCEPT("revert", instance.safeTransferFrom(user1, user2, tokenId, 1, 0x00, {from: ownerAddress}));
        //proxy can transfer
        result = await instance.safeTransferFrom(user1, user2, tokenId, 1, 0x00, {from: currentProxyAddress});
        balance = await instance.balanceOf.call(user2, tokenId);
        assert.equal(balance, 1, "Token balance should be 1");
    })
​
    //mint -> approval -> transfer to user by approved address -> transfer by owner/proxy
    it('approval test', async () => {
        let tokenId = 2;
        let balance = await instance.balanceOf.call(holderAddress, tokenId);
        // console.log(balance), 100
        let result = await instance.setApprovalForAll(approvedUser, 1, {from:holderAddress});
        result = await instance.safeTransferFrom(holderAddress, user2, tokenId, 5, 0x00, {from:approvedUser});
        balance = await instance.balanceOf.call(user2, tokenId);
        assert.equal(balance, 5, "Token balance should be 5");
        //transfer again
        //revert ERC1155: caller is not owner nor approve
        await EXPECT_EXCEPT("revert", instance.safeTransferFrom(user2, user1, tokenId, 3, 0x00, {from:approvedUser}));
        result = await instance.safeTransferFrom(user2, user1, tokenId, 3, 0x00, {from:newProxyAddress});
        balance = await instance.balanceOf.call(user2, tokenId);
        assert.equal(balance, 2, "Token balance should be 2");
    })
​
    
    it('setURI test (only for Owner)', async () => {
        let newURI = "https://flask-heroku-api-test1.herokuapp.com/token";
        let result = await instance.setBaseTokenURI(newURI);
        //check URI
        let tokenId = 1;
        let tokenURI = await instance.uri(tokenId);
        assert.equal(tokenURI, newURI + "/" + tokenId, "new URI should be set");
        //not allowed to set URI
        await EXPECT_EXCEPT("revert", instance.setBaseTokenURI(newURI, {from:otherAddress}));
    })
​
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
        result = await instance.pauseToken()
        await EXPECT_EXCEPT("revert", instance.safeTransferFrom(holderAddress, receiverAddress, tokenId, 1, 0x00, {from: holderAddress}));
​
    })
​
});