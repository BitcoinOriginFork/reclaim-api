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
    `, [1, '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN', 10, 2404, new Date()])
    await client.query(`
      INSERT INTO currency_balances (currency_id, address, balance, block, created)
        VALUES ($1, $2, $3, $4, $5)
    `, [4, '0x3F62A2BE59E59F0479b09D413158512D6Da5eA68', 5, 10020, new Date()])
  })
}

seed()
