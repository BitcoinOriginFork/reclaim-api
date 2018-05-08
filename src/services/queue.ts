import { redisCreds } from '../config/redis'
import { Chain } from '../crypto'
import { createClaim } from '../db/claims'
import { DbClaim } from '../db/interfaces'

const kue = require('kue')
let queue

function createQueue() {
  const redisConnection = redisCreds()
  return kue.createQueue({
    prefix: 'q',
    redis: {
      port: redisConnection.port,
      host: redisConnection.host
    }
  })
}

export interface Claim {
  chainAddress: string
  signature: string
  chain: Chain
  claimToAddress: string
  message: string
}

export function createClaimJob(claim: Claim) {
  if (!queue) {
    queue = createQueue()
  }

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

export function processQueue() {
  if (!queue) {
    queue = createQueue()
  }

  queue.process('claim', async function ({data}: {data: Claim}, done: Function) {
    try {
      const res = await processClaim(data)
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
}

// TODO: This should actually return the transaction hash for a successful claim
export async function processClaim(claim: Claim): Promise<DbClaim> {
  const dbClaim = await createClaim(claim)

  let txHash, success

  // To keep the tests simple, we do not submit the claim to an origin network
  // when we are running the tests
  if (process.env.NODE_ENV !== 'test') {
    // {txHash, success} = await submitClaim
    console.log('TODO')
  } else {
    txHash = '0x000'
    success = true
  }

  // TODO: Update claim depending on state of claim submission

  return dbClaim
}
