import { DbCreds, dbCreds, dbInitCreds, database } from '../config/db'
import { Client } from 'pg'
const { exec } = require('child_process')

const creds: DbCreds = dbCreds()
const dbUrl = `postgres://${creds.user}:${creds.password}@${creds.host}/${creds.database}`

export async function unlockDb () {
  exec(`DATABASE_URL=${dbUrl} npm run migrate-unlock`, function (error: any, stdout: any, stderr: any) {
    if (error !== null) {
      console.log('exec error: ' + error)
    }
  })
}
