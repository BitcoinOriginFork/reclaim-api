import { queryHandler } from './connection'
import { Client } from 'pg'
import { Claim } from './interfaces'
import { Chain } from '../crypto'

export enum ClaimStatus {
  pending = 'pending',
  complete = 'complete',
  failed = 'failed'
}

export function getClaimByBtcoAddress (btcoAddress: string): Promise<Claim> {
  return queryHandler(async function (client: Client) {
    const claims: Claim[] = (await client.query(`SELECT * FROM claims WHERE "btcoAddress" = $1`, [btcoAddress])).rows
    return claims.length > 0 ? claims[0] : {}
  })
}

export async function createClaim (
  btcoAddress: string,
  signature: string,
  chain: Chain,
  chainAddress: string,
  message: string
): Promise<Claim> {
  await queryHandler(async function (client: Client) {
    await client.query(
      `INSERT INTO claims
      ("btcoAddress", "signature", "chain", "chainAddress", "message", "status", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [btcoAddress, signature, chain, chainAddress, message, ClaimStatus.pending, new Date(), new Date()]
    )
  })

  return getClaimByBtcoAddress(btcoAddress)
}
