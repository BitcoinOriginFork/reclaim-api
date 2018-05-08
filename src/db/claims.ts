import { queryHandler } from './connection'
import { Client } from 'pg'
import { DbClaim } from './interfaces'
import { Chain } from '../crypto'
import { Claim } from '../services/queue'

export enum ClaimStatus {
  pending = 'pending',
  complete = 'complete',
  failed = 'failed'
}

export function getClaimByBtcoAddress (btcoAddress: string): Promise<DbClaim> {
  return queryHandler(async function (client: Client) {
    const claims: Claim[] = (await client.query(`SELECT * FROM claims WHERE "btcoAddress" = $1`, [btcoAddress])).rows
    return claims.length > 0 ? claims[0] : {}
  })
}

export async function createClaim (claim: Claim): Promise<DbClaim> {
  await queryHandler(async function (client: Client) {
    await client.query(
      `INSERT INTO claims
      ("btcoAddress", "signature", "chain", "chainAddress", "message", "status", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        claim.claimToAddress,
        claim.signature,
        claim.chain,
        claim.chainAddress,
        claim.message,
        ClaimStatus.pending,
        new Date(),
        new Date()
      ]
    )
  })

  return getClaimByBtcoAddress(claim.claimToAddress)
}
