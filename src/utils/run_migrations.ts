import { DbCreds, dbCreds, dbInitCreds } from '../config/db'
import { Client } from 'pg'
const { exec } = require('child_process')

export function runMigrations () {
  const creds: DbCreds = dbCreds()
  const initCreds: DbCreds = dbInitCreds()
  const dbUrl = `postgres://${creds.user}:${creds.password}@${creds.host}:${creds.port}/${creds.database}`

  return new Promise(async (res, rej) => {
    try {
      const client = new Client({
        user: initCreds.user,
        host: initCreds.host,
        database: initCreds.database,
        password: initCreds.password,
        port: initCreds.port,
      })

      await client.connect()

      const dbCheck = await client.query(`SELECT 1 from pg_database WHERE datname='${creds.database}';`)
      if (dbCheck.rowCount === 0) {
        await client.query(`CREATE DATABASE "${creds.database}";`).catch(e => e)
        await client.query(`GRANT ALL ON DATABASE "${creds.database}" TO ${creds.user};`)
        console.log('Database created')
      }

      exec(`
        ${process.env.NODE_ENV !== 'test' ? 'cd /server && ' : ''}DATABASE_URL=${dbUrl} npm run migrate-up
      `, function (error: any, stdout: any, stderr: any) {
        if (error !== null) {
          console.log('exec error: ' + error)
        }

        res()
      })
    } catch (e) {
      rej(e)
    }
  })
}
