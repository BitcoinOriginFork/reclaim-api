export interface DbCreds {
  user: string
  host: string
  database: string
  password: string
  port: number
}

function getCreds(): {host: string, pw: string, db: string, port: string} {
  const host = process.env.DB_HOST
  const pw = process.env.DB_PASSWORD
  const db = process.env.DB_DATABASE
  const port = process.env.DB_PORT

  if (!host || !db || !pw || !port) {
    throw new Error('No DB credentials found')
  }

  return {host, pw, db, port}
}

export function dbCreds (): DbCreds {
  const {host, pw, db, port} = getCreds()
  return {
    user: 'postgres',
    host: host,
    database: db,
    password: pw,
    port: Number(port),
  }
}

export function dbInitCreds (): DbCreds {
  const {host, pw, port} = getCreds()
  return {
    user: 'postgres',
    host: host,
    database: 'postgres',
    password: pw,
    port: Number(port),
  }
}
