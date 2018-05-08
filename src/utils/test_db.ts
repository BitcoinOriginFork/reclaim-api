import { runMigrations } from './run_migrations'
import { queryHandler } from '../db/connection'
import { dbInitCreds, DbCreds } from '../config/db'
import { Client } from 'pg'

let testInit = true

export async function migrateDb (): Promise<{}> {
  const initCreds: DbCreds = dbInitCreds()

  // If it is the first test to hit this section, drop the database such that
  // we have clean migration
  if (testInit) {
    const client = new Client({
      user: initCreds.user,
      host: initCreds.host,
      database: initCreds.database,
      password: initCreds.password,
      port: initCreds.port,
    })

    await client.connect()
    await client.query(`DROP DATABASE IF EXISTS reclaim`)

    testInit = false
  }

  return runMigrations()
}

// TODO: There is some overhead here consider we truncate each table manually. Add a fancy PG function here
export function cleanDb () {
  return queryHandler(async function (client: Client) {
    return client.query(`TRUNCATE claims CASCADE`)
  })
}
