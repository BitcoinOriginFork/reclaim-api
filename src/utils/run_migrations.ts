import { DbCreds, dbCreds, dbInitCreds, database } from '../config/db'
import { Client } from 'pg'
const { exec } = require('child_process')

const creds: DbCreds = dbCreds()
const initCreds: DbCreds = dbInitCreds()
const dbUrl = `postgres://${creds.user}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`

export function runMigrations () {
  return new Promise(async (res) => {
    const client = new Client({
      user: initCreds.user,
      host: initCreds.host,
      database: initCreds.database,
      password: initCreds.password,
      port: initCreds.port,
    })

    await client.connect()

    const dbCheck = await client.query(`SELECT 1 from pg_database WHERE datname='${database}';`)
    if (dbCheck.rowCount === 0) {
      await client.query(`CREATE DATABASE "${database}";`).catch(e => e)
      await client.query(`GRANT ALL ON DATABASE "${database}" TO ${creds.user};`)
    }

    exec(`DATABASE_URL=${dbUrl} npm run migrate-up`, function (error: any, stdout: any, stderr: any) {
      if (error !== null) {
        console.log('exec error: ' + error)
      }

      res()
    })
  })
}
