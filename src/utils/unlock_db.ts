import { DbCreds, dbCreds, dbInitCreds } from '../config/db'
import { Client } from 'pg'
const { exec } = require('child_process')

export async function unlockDb () {
  const creds: DbCreds = dbCreds()
  const dbUrl = `postgres://${creds.user}:${creds.password}@${creds.host}/${creds.database}`

  exec(`DATABASE_URL=${dbUrl} npm run migrate-unlock`, function (error: any, stdout: any, stderr: any) {
    if (error !== null) {
      console.log('exec error: ' + error)
    }
  })
}
