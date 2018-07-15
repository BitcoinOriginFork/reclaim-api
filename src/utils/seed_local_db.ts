import { queryHandler } from '../db/connection'
import { Client } from 'pg'

async function seed() {
  if (process.env.NODE_ENV !== 'SEED') {
    throw new Error('Not configured to seed the DB')
  }

  await queryHandler(async (client: Client) => {
    await client.query(`
      INSERT INTO currency_balances (currency_id, address, balance, block, created)
        VALUES ($1, $2, $3, $4, $5)
    `, [1, '1Hw54G2iKy15VNiVF9y5rnaAYHZ5yV4Uzt', 10, 2404, new Date()])
  })
}

seed()
