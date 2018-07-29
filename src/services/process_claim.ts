import { redisCreds } from '../config/redis'
import { Chain } from '../crypto'
import { createPendingClaim, finaliseClaim } from '../db/claims'
import { DbClaim } from '../db/interfaces'
import { updateClaimableBalance } from './eth_interactions'

export interface Claim {
  chainAddress: string
  signature: string
  chain: Chain
  claimToAddress: string
  message: string
}

// TODO: We should throw these in the DB, will hardcode for now
const currencyToXboRates = {
  [Chain.bitcoin]: 100,
  [Chain.bitcoinCash]: 20,
  [Chain.litecoin]: 10,
  [Chain.ethereum]: 5,
  [Chain.dash]: 1
}

// There is a risk here of stuck claims, whereby the claim is created as pending,
// the contract bombs, so the claim is never moved to complete.
// TODO: Potentially we should run a scheduled job to check for claims that are in the
// pending state and were created more than an hour a go, or in the failed state
export async function processClaim(claim: Claim): Promise<DbClaim> {
  const {balanceId, nativeBalance, claimToAddress} = await createPendingClaim(claim)

  let txHash, success

  // To keep the tests simple, we do not submit the claim to an xbogin network
  // when we are running the tests
  if (process.env.NODE_ENV !== 'test') {
    try {
      // 10 ** 18 to handle 18 decimals in contract
      const balanceFromClaim = Math.ceil(nativeBalance * currencyToXboRates[claim.chain] * (10 ** 18))
      txHash = await updateClaimableBalance(claimToAddress, balanceFromClaim)
      success = true
    } catch (e) {
      console.log(e)
      txHash = ''
      success = false
    }
  } else {
    txHash = '0x000'
    success = true
  }

  return finaliseClaim(balanceId, claimToAddress, txHash, success)
}
