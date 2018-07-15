const { Client } = require('pg')
const { dbCreds } = require('../dist/config/db')
const client = new Client(dbCreds())

exports.up = async () => {
  const date = new Date()
  await client.connect()
  await client.query(`
    INSERT INTO currency_types (currency, created) VALUES
      ('bitcoin', $1),
      ('bitcoinCash', $1),
      ('litecoin', $1),
      ('ethereum', $1),
      ('dash', $1);
  `, [date])

  await client.end()
}

exports.down = async () => {
  await client.connect()
  await client.query(`
    DELETE FROM currency_types where id >= 1;
  `)

  await client.end()
}
