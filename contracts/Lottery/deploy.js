require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const { compileContract } = require('./compile')

const deployContract = async () => {
  const lotteryContract = compileContract()
  const { ACCOUNT_MNEMONIC, ACCOUNT_ADDRESS, PROJECT_ENDPOINT } = process.env
  const provider = new HDWalletProvider(ACCOUNT_MNEMONIC, PROJECT_ENDPOINT)
  const web3 = new Web3(provider)

  const accounts = await web3.eth.getAccounts()
  const account = accounts.find(acc => acc === ACCOUNT_ADDRESS)

  console.info('Attempting to deploy Lottery contract')
  const result = await new web3.eth.Contract(lotteryContract.abi)
    .deploy({
      data: lotteryContract.evm.bytecode.object
    })
    .send({ gas: 1000000, from: account })
  console.info('Lottery contract deployed to => ', result.options.address)

  provider.engine.stop()
}

module.exports = {
  deployContract
}
