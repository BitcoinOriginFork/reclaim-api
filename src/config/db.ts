export interface DbCreds {
  user: string
  host: string
  database: string
  password: string
  port: number
}

export const database = 'reclaim'

function getProdCreds(): {host: string, pw: string} {
  const host = process.env.DB_HOST
  const pw = process.env.DB_PASSWORD

  if (!host || !pw) {
    throw new Error('No Production credentials found')
  }

  return {host, pw}
}

export function dbCreds (): DbCreds {
  if (process.env.NODE_ENV === 'production') {
    const {host, pw} = getProdCreds()

    return {
      user: 'postgres',
      host: host,
      database: database,
      password: pw,
      port: 5432,
    }
  } else {
    return {
      user: 'postgres',
      host: '127.0.0.1',
      database: database,
      password: '',
      port: 5432,
    }
  }
}

export function dbInitCreds (): DbCreds {
  if (process.env.NODE_ENV === 'production') {
    const {host, pw} = getProdCreds()

    return {
      user: 'postgres',
      host: host,
      database: 'postgres',
      password: pw,
      port: 5432,
    }
  } else {
    return {
      user: 'postgres',
      host: '127.0.0.1',
      database: 'postgres',
      password: '',
      port: 5432,
    }
  }
}
