export interface DbCreds {
  user: string
  host: string
  database: string
  password: string
  port: number
}

function getCreds(): {host: string, pw: string, db: string} {
  const host = process.env.DB_HOST
  const pw = process.env.DB_PASSWORD
  const db = process.env.DB_DATABASE

  if (!host || !db) {
    throw new Error('No DB credentials found')
  }

  if (process.env.NODE_ENV !== 'test' && !pw) {
    throw new Error('No DB password found')
  }

  return {host, pw, db}
}

export function dbCreds (): DbCreds {
  const {host, pw, db} = getCreds()
  return {
    user: 'postgres',
    host: host,
    database: db,
    password: pw,
    port: 5432,
  }
}

export function dbInitCreds (): DbCreds {
  const {host, pw} = getCreds()
  return {
    user: 'postgres',
    host: host,
    database: 'postgres',
    password: pw,
    port: 5432,
  }
}
