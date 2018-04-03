import { runMigrations } from './run_migrations'
import { queryHandler } from '../db/connection'
import { Client } from 'pg'

export async function migrateDb (): Promise<{}> {
  return runMigrations()
}

// TODO: There is some overhead here consider we truncate each table manually. Add a fancy PG function here
export function cleanDb () {
  return queryHandler(async function (client: Client) {
    await client.query(`TRUNCATE claims CASCADE`)
    return
  })
}
