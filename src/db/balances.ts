import { queryHandler } from './connection'
import { Client } from 'pg'
import { Chain } from '../crypto'
import { chainToId } from './claims'

export interface CurrencyBalance {
  id?: number
  currency_id: number
  address: string
  balance: number
  block: number
  created: Date
  claimed?: Date
}

export function getCurrencyBalance (chain: Chain, address: string): Promise<CurrencyBalance> {
  const currencyId = chainToId[chain]

  return queryHandler(async function (client: Client) {
    const balances: CurrencyBalance[] = (await client.query(
      `SELECT * FROM currency_balances WHERE currency_id = $1 and address = $2`,
      [currencyId, address]
    )).rows

    return balances.length ? balances[0] : {}
  })
}
