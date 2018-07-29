import { Chain } from '../crypto'
import { claimCreds } from '../config/claim'
import { xboAbi } from './xbo_abi'
import BigNumber from 'bignumber.js'
const Web3 = require('web3')

function contractRef(): any {
  const creds = claimCreds()
  const web3 = new Web3(creds.endpoint)
  return new web3.eth.Contract(xboAbi, creds.xboContractAddress)
}

export function getClaimableBalance(address: string) {
  const xbo = contractRef()
  return xbo.methods.getClaimableBalance(address).call()
}

// Here we check for a balance against the address, if it doesnt exist, we create,
// otherwise we update
export async function updateClaimableBalance(address: string, balance: BigNumber): Promise<string> {
  const xbo = contractRef()
  let txHash
  const currentBalance = new BigNumber(await xbo.methods.getClaimableBalance(address).call())

  if (currentBalance.toNumber() !== 0) {
    const newBalance = currentBalance.plus(balance)
    const createClaimerQuery = xbo.methods.setClaimableBalance(address, balance)
    txHash = await signAndSubmitContractQuery(createClaimerQuery)
  } else {
    const createClaimerQuery = xbo.methods.createNewClaimer(address, balance)
    txHash = await signAndSubmitContractQuery(createClaimerQuery)
  }

  return txHash
}

async function signAndSubmitContractQuery(query: any) {
  const creds = claimCreds()
  const web3 = new Web3(creds.endpoint)
  const fromAddress = web3.eth.accounts.privateKeyToAccount(creds.xboPrivateKey).address

  const encodedABI = query.encodeABI()
  const gas = await query.estimateGas({from: fromAddress})

  const tx = {
    from: fromAddress,
    to: creds.xboContractAddress,
    gas: gas,
    data: encodedABI,
  }

  const signedTx = await web3.eth.accounts.signTransaction(tx, creds.xboPrivateKey)
  return new Promise((res, rej) => {
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
      .on('transactionHash', (hash) => res(hash))
      .on('error', (err) => rej(err))
  })

}
