const path = require('path')
const fs = require('fs')
const solc = require('solc')

const lotteryPath = path.resolve(__dirname, 'Lottery.sol')
const source = fs.readFileSync(lotteryPath, 'utf8')
const contract = 'Lottery.sol'

const input = {
  language: 'Solidity',
  sources: {
    [contract]: {
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
}

const compileContract = () => JSON.parse(solc.compile(JSON.stringify(input))).contracts[contract].Lottery

module.exports = {
  compileContract
}
