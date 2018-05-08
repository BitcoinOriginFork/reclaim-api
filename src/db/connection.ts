import { Pool, Client } from 'pg'
import { dbCreds } from '../config/db'
let pool: any

// Pass the queryHandler a function that returns a promise and has the client as the first parameter
export async function queryHandler (queryFunction: Function): Promise<any> {
  if (!pool) {
    pool = createPool()
  }

  const client = await pool.connect()
  try {
    const res = await queryFunction(client)
    return res
  } finally {
    client.release()
  }
}

function createPool() {
  // the pool with emit an error on behalf of any idle clients
  // it contains if a backend error or network partition happens
  const newPool = new Pool(dbCreds())
  newPool.on('error', (err: Error, client: Client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })

  return newPool
}
