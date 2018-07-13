const { Client } = require('pg')
const { dbCreds } = require('../dist/config/db')
const client = new Client(dbCreds())

exports.up = async () => {
  await client.connect()
  await client.query(`
    CREATE TABLE currency_balances (
      id integer PRIMARY KEY,
      currency_id integer references currency_types(id),
      address character varying(255) NOT NULL,
      balance numeric NOT NULL,
      block integer NOT NULL,
      created timestamp with time zone NOT NULL,
      claimed timestamp with time zone
    );

    ALTER TABLE currency_balances OWNER TO postgres;
    CREATE SEQUENCE currency_balances_seq_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    ALTER TABLE currency_balances_seq_id OWNER TO postgres;
    ALTER SEQUENCE currency_balances_seq_id OWNED BY currency_balances.id;
    ALTER TABLE ONLY claims ALTER COLUMN id SET DEFAULT nextval('currency_balances_seq_id'::regclass);
  `)

  await client.end()
}

exports.down = async () => {
  await client.connect()
  await client.query(`
    DROP TABLE currency_balances;
  `)

  await client.end()
}
