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

export function getClaimsByXboAddress (xboAddress: string): Promise<DbClaim> {
  return queryHandler(async function (client: Client) {
    return (await client.query(`SELECT * FROM claims WHERE xbo_address = $1`, [xboAddress])).rows as Claim[]
  })
}

export async function finaliseClaim (balanceId: number, claimToAddress: string, txHash: string, success: boolean): Promise<DbClaim> {
  return queryHandler(async function (client: Client) {
    await client.query(
      `UPDATE claims SET tx_hash=$1, status=$2, updated=$3 where xbo_address = $4 and currency_balance_id=$5`,
      [txHash, success ? ClaimStatus.complete : ClaimStatus.failed, new Date(), claimToAddress, balanceId]
    )

    return client.query(`SELECT * FROM claims where xbo_address = $1 and currency_balance_id = $2`, [claimToAddress, balanceId])
  })
}

export function createPendingClaim(claim: Claim): Promise<{balanceId: number, nativeBalance: number, claimToAddress: string}> {
  return queryHandler(async function (client: Client) {
    try {
      await client.query('BEGIN')

      // SELECT FOR UPDATE used in a transaction to protect against race conditions for a single claim
      const balanceRows = await client.query(
        `SELECT * FROM currency_balances where address = $1 and currency_id = $2 FOR UPDATE`,
        [claim.chainAddress, chainToId[claim.chain]]
      )

      const balance = balanceRows.rows[0]
      if (!balance) {
        throw new Error('Invalid claim. It does not exist in the xbo chain snapshot')
      }

      if (balance.claimed) {
        throw new Error('This balance has already been claimed')
      }

      await client.query(
        `INSERT INTO claims
        (xbo_address, signature, message, currency_balance_id, status, created, updated)
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

      return {balanceId: balance.id, nativeBalance: balance.balance, claimToAddress: claim.claimToAddress}
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    }
  })
}
