const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const { compileContract } = require('../contracts/Lottery')

const web3 = new Web3(ganache.provider())

const lotteryContract = compileContract()
let mockAccounts = null
let mockLottery = null
// eslint-disable-next-line mocha/no-top-level-hooks
beforeEach(async function () {
  // Get a list of all accounts
  mockAccounts = await web3.eth.getAccounts()
  // Use one of those accounts to deploy the contract
  mockLottery = await new web3.eth.Contract(lotteryContract.abi)
    .deploy({
      data: lotteryContract.evm.bytecode.object
    })
    .send({
      from: mockAccounts[0],
      gas: 1000000
    })
})

describe('Lottery contract', function () {
  it('deploys the lottery contract', function () {
    assert.ok(mockLottery.options.address)
  })

  it('allows one account to enter', async function () {
    await mockLottery.methods.enter().send({
      from: mockAccounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    })

    const players = await mockLottery.methods.getPlayers().call({
      from: mockAccounts[0]
    })

    assert.equal(mockAccounts[0], players[0])
    assert.equal(1, players.length)
  })

  it('allows multiple account to enter', async function () {
    await mockLottery.methods.enter().send({
      from: mockAccounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    })

    await mockLottery.methods.enter().send({
      from: mockAccounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    })

    await mockLottery.methods.enter().send({
      from: mockAccounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    })

    const players = await mockLottery.methods.getPlayers().call({
      from: mockAccounts[0]
    })

    assert.equal(mockAccounts[0], players[0])
    assert.equal(mockAccounts[1], players[1])
    assert.equal(mockAccounts[2], players[2])
    assert.equal(3, players.length)
  })

  it('requires a minimum amount of ether to enter', async function () {
    try {
      await mockLottery.methods.enter().send({
        from: mockAccounts[0],
        value: web3.utils.toWei('0.001', 'ether')
      })
      assert(false)
    } catch (error) {
      assert(error)
    }
  })

  it('only manager can call pickWinner', async function () {
    try {
      await mockLottery.methods.pickWinner().send({
        from: mockAccounts[1]
      })
      assert(false)
    } catch (error) {
      assert(error)
    }
  })

  it('sends money to the winner and resets the players array', async function () {
    await mockLottery.methods.enter().send({
      from: mockAccounts[0],
      value: web3.utils.toWei('1', 'ether')
    })

    const initialBalance = await web3.eth.getBalance(mockAccounts[0])
    await mockLottery.methods.pickWinner().send({
      from: mockAccounts[0]
    })
    const finalBalance = await web3.eth.getBalance(mockAccounts[0])
    // difference should be slightly less than 1 ether taking into account gas cost
    assert(finalBalance - initialBalance > web3.utils.toWei('0.8', 'ether'))

    // balance should be 0
    const contractBalance = await web3.eth.getBalance(mockLottery.options.address)
    assert.equal(0, contractBalance)

    // players array should be reset
    const players = await mockLottery.methods.getPlayers().call({
      from: mockAccounts[0]
    })
    assert.equal(0, players.length)
  })
})
