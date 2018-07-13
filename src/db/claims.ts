import { queryHandler } from './connection'
import { Client } from 'pg'
import { DbClaim } from './interfaces'
import { Chain } from '../crypto'
import { Claim } from '../services/process_claim'

export enum ClaimStatus {
  pending = 'pending',
  complete = 'complete',
  failed = 'failed'
}

export const chainToId = {
  [Chain.bitcoin]: 1,
  [Chain.bitcoinCash]: 2,
  [Chain.litecoin]: 3,
  [Chain.ethereum]: 4,
  [Chain.dash]: 5
}

export function getClaimsByOriAddress (oriAddress: string): Promise<DbClaim> {
  return queryHandler(async function (client: Client) {
    return (await client.query(`SELECT * FROM claims WHERE ori_address = $1`, [oriAddress])).rows as Claim[]
  })
}

// There is a risk here of stuck claims, whereby the claim is created as pending,
// the contract bombs, so the claim is never moved to complete.
// TODO: Potentially we should run a scheduled job to check for claims that are in the
// pending state and were created more than an hour a go
export async function createClaim (claim: Claim): Promise<DbClaim> {
  // Create a pending claim, ensuring a claim does not already exist
  const {balanceId, claimToAddress} = await createPendingClaim(claim)

  // Interact with the smart contract, updating the users claimable balance
  const txHash = '0x'

  // Update the claim as complete, reference the tx hash
  return queryHandler(async function (client: Client) {
    await client.query(
      `UPDATE claims SET tx_hash=$1, status=$2 where ori_address = $3 and currency_balance_id=$4`,
      [txHash, ClaimStatus.complete, claimToAddress, balanceId]
    )

    return client.query(`SELECT * FROM claims where ori_address = $1 and currency_balance_id = $2`, [claimToAddress, balanceId])
  })
}

export function createPendingClaim(claim: Claim) {
  return queryHandler(async function (client: Client) {
    try {
      await client.query('BEGIN')

      // SELECT FOR UPDATE used in a transaction to protect against race conditions for a single claim
      const balanceRows = await client.query(
        `SELECT * FROM currency_balances where address = $1 and currency_id = $2 FOR UPDATE`,
        [claim.chainAddress, chainToId[claim.chain]]
      )

      const balance = balanceRows[0]
      if (!balance) {
        throw new Error('Invalid claim. It does not exist in the ORI chain snapshot')
      }

      if (balance.claimed) {
        throw new Error('This balance has already been claimed')
      }

      await client.query(
        `INSERT INTO claims
        (ori_address, signature, message, currency_balance_id, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          claim.claimToAddress,
          claim.signature,
          claim.message,
          balance.id,
          ClaimStatus.pending,
          new Date(),
          new Date()
        ]
      )

      await client.query(
        `UPDATE currency_balances SET claimed=$1 where id = $2`,
        [new Date(), balance.id]
      )

      await client.query('COMMIT')

      return {balanceId: balance.id, claimToAddress: claim.claimToAddress}
    } catch (e) {
      await client.query('ROLLBACK')
    }
  })
}
