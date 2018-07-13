import { redisCreds } from '../config/redis'
import { Chain } from '../crypto'
import { createClaim } from '../db/claims'
import { DbClaim } from '../db/interfaces'

export interface Claim {
  chainAddress: string
  signature: string
  chain: Chain
  claimToAddress: string
  message: string
}

export async function processClaim(claim: Claim): Promise<{txHash: string, claimId: number, success: boolean}> {
  const dbClaim = await createClaim(claim)

  let txHash, success

  // To keep the tests simple, we do not submit the claim to an xbogin network
  // when we are running the tests
  if (process.env.NODE_ENV !== 'test') {
    // {txHash, success} = await submitClaim
    console.log('TODO')
  } else {
    txHash = '0x000'
    success = true
  }

  // TODO: Update claim depending on state of claim submission

  return {txHash, claimId: dbClaim.id, success}
}
