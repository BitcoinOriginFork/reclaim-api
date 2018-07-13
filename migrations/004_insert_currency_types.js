const { Client } = require('pg')
const { dbCreds } = require('../dist/config/db')
const client = new Client(dbCreds())

exports.up = async () => {
  await client.connect()
  await client.query(`
    INSERT INTO currency_types (currency, created) VALUES
      ('bitcoin', ${new Date()}),
      ('bitcoinCash', ${new Date()}),
      ('litecoin', ${new Date()}),
      ('ethereum', ${new Date()}),
      ('dash', ${new Date()});
  `)

  await client.end()
}

exports.down = async () => {
  await client.connect()
  await client.query(`
    DELETE FROM currency_types where id >= 1;
  `)

  await client.end()
}
