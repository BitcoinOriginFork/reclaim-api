const { Client } = require('pg')
const { dbCreds } = require('../dist/config/db')
const client = new Client(dbCreds())

exports.up = async () => {
  await client.connect()
  await client.query(`
    CREATE TABLE currency_types (
      id integer PRIMARY KEY,
      currency character varying(255) NOT NULL UNIQUE,
      created timestamp with time zone NOT NULL
    );

    ALTER TABLE currency_types OWNER TO postgres;
    CREATE SEQUENCE curreny_types_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    ALTER TABLE curreny_types_id_seq OWNER TO postgres;
    ALTER SEQUENCE curreny_types_id_seq OWNED BY currency_types.id;
    ALTER TABLE ONLY currency_types ALTER COLUMN id SET DEFAULT nextval('curreny_types_id_seq'::regclass);
  `)

  await client.end()
}

exports.down = async () => {
  await client.connect()
  await client.query(`
    DROP TABLE currency_types;
  `)

  await client.end()
}
