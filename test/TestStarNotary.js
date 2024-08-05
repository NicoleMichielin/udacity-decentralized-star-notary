const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    let tolerance = Number(web3.utils.toWei("0.001", "ether")); // Tolleranza di 0.001 ether
    assert.isAbove(value, Number(starPrice) - tolerance, "Value is not above the expected range");
    assert.isBelow(value, Number(starPrice) + tolerance, "Value is not below the expected range");
});


// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let tokenId = 6;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name(), 'StarNotary Token');
    assert.equal(await instance.symbol(), 'SNT');
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();

    let user1 = accounts[1];
    let user2 = accounts[2];

    // 1. create 2 Stars with different tokenId
    let starId1 = 7;
    let starId2 = 8;
    await instance.createStar('Star 1', starId1, {from: user1});
    await instance.createStar('Star 2', starId2, {from: user2});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1,starId2, {from: user1});

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(starId1), user2);
    assert.equal(await instance.ownerOf(starId2), user1);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();

    let user1 = accounts[1];
    let user2 = accounts[2];

    // 1. create a Star with different tokenId
    let starId = 9;
    await instance.createStar('lookupTokenIdToStarInfo test', starId, {from: user1});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId, {from: user1});

    // 3. Verify the star owner changed.
    assert.equal(user2,await instance.ownerOf(starId));
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let starId = 10;
    await instance.createStar('lookupTokenIdToStarInfo test', starId, {from: accounts[0]});

    // 2. Call your method lookupTokenIdToStarInfo
    // 3. Verify if you Star name is the same
    assert.equal(await instance.lookUpTokenIdToStarInfo(starId), 'lookupTokenIdToStarInfo test');
});