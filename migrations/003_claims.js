const { Client } = require('pg')
const { dbCreds } = require('../dist/config/db')
const client = new Client(dbCreds())

exports.up = async () => {
  await client.connect()
  await client.query(`
    CREATE TABLE claims (
      id integer PRIMARY KEY,
      ori_address character varying(255) NOT NULL,
      signature character varying(255) NOT NULL UNIQUE,
      message character varying(255) NOT NULL,
      currency_balance_id integer references currency_balances(id),
      tx_hash character varying(255),
      status character varying(255) NOT NULL,
      created timestamp with time zone NOT NULL,
      updated timestamp with time zone NOT NULL
    );

    ALTER TABLE claims OWNER TO postgres;
    CREATE SEQUENCE claims_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    ALTER TABLE claims_id_seq OWNER TO postgres;
    ALTER SEQUENCE claims_id_seq OWNED BY claims.id;
    ALTER TABLE ONLY claims ALTER COLUMN id SET DEFAULT nextval('claims_id_seq'::regclass);
  `)

  await client.end()
}

exports.down = async () => {
  await client.connect()
  await client.query(`
    DROP TABLE claims;
  `)

  await client.end()
}
