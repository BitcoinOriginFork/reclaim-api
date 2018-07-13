import { Chain } from '../crypto'
import { claimCreds } from '../config/claim'
import { xboAbi } from './xbo_abi'
import Web3 from 'web3'
import { Contract, TransactionObject } from 'web3/types'

function contractRef(): Contract {
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
export async function updateClaimableBalance(address: string, balance: number): Promise<string> {
  const xbo = contractRef()

  // Check for a balance... Not sure how the contract responds to getClaimableBalance
  // if the balance does not exist. Does it return 0 or does it throw?
  // Assuming it throws here
  let currentBalance
  let txHash
  try {
    currentBalance = await xbo.methods.getClaimableBalance(address).call()
  } catch (e) {
    // TODO: Need more info on this throw to ensure we only call it if the err is
    // of the right type
    console.log(e.message)
    const createClaimerQuery = xbo.methods.createNewClaimer(address, balance)
    txHash = await signAndSubmitContractQuery(createClaimerQuery)
  }

  // If there is a current balance, it signifies that the getClaimableBalance did
  // not throw, therefore we should update the balance
  if (currentBalance) {
    const newBalance = currentBalance + balance
    const createClaimerQuery = xbo.methods.setClaimableBalance(address, balance)
    txHash = await signAndSubmitContractQuery(createClaimerQuery)
  }

  return txHash
}

async function signAndSubmitContractQuery(query: TransactionObject<any>) {
  const creds = claimCreds()
  const web3 = new Web3(creds.endpoint)

  const encodedABI = query.encodeABI()
  const gas = await query.estimateGas({from: creds.xboAddress})

  const tx = {
    from: creds.xboAddress,
    to: creds.xboContractAddress,
    gas: gas,
    data: encodedABI,
  }

  const signedTx = await web3.eth.accounts.signTransaction(tx, creds.xboPrivateKey) as string

  return new Promise((res, rej) => {
    web3.eth.sendSignedTransaction(signedTx)
      .on('transactionHash', (hash) => res(hash))
      .on('error', (err) => rej(err))
  })

}
