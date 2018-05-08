import { redisCreds } from '../config/redis'
import { Chain } from '../crypto';
import { createClaim } from '../db/claims';
import { DbClaim } from '../db/interfaces';

const kue = require('kue')
const redisConnection = redisCreds()
const queue = kue.createQueue({
  prefix: 'q',
  redis: {
    port: redisConnection.port,
    host: redisConnection.host
  }
})

export interface Claim {
  chainAddress: string
  signature: string
  chain: Chain
  claimToAddress: string
  message: string
}

export function createClaimJob(claim: Claim) {
  return new Promise((res, rej) => {
    const job = queue
      .create('claim', claim)
      .ttl(20000)
      .removeOnComplete(true)
      .save()

    job
      .on('complete', (result: any) => res(result))
      .on('failed', (errorMessage: any) => rej(errorMessage))
  })
}

queue.process('claim', async function (claim: Claim, done: Function) {
  try {
    const res = await processClaim(claim)
    done(null, res)
  } catch (e) {
    done(e)
  }
})

// Graceful Queue Shutdown
process.once( 'SIGTERM', function () {
  queue.shutdown(5000, function(err: string) {
    console.log(`Kue shutdown: ${err || 'No Error'}`)
    process.exit(0)
  })
})

// TODO: This should actually return the transaction hash for a successful claim
export async function processClaim(claim: Claim): Promise<DbClaim> {
  const dbClaim = await createClaim(claim)
  // TODO: Submit claim to smart contract
  // TODO: Update claim depending on state of claim submission
  return dbClaim
}
