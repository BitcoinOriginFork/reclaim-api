const { Client } = require('pg')
const { dbCreds } = require('../dist/config/db')
const client = new Client(dbCreds())

exports.up = async () => {
  await client.connect()
  await client.query(`
    CREATE TABLE claims (
      id integer PRIMARY KEY,
      "btcoAddress" character varying(255) NOT NULL UNIQUE,
      "signature" character varying(255) NOT NULL UNIQUE,
      "chain" character varying(255) NOT NULL,
      "chainAddress" character varying(255) NOT NULL,
      "message" character varying(255) NOT NULL,
      "status" character varying(255) NOT NULL,
      "createdAt" timestamp with time zone NOT NULL,
      "updatedAt" timestamp with time zone NOT NULL
    );

    ALTER TABLE claims OWNER TO postgres;
    CREATE SEQUENCE claims_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    ALTER TABLE claims_id_seq OWNER TO postgres;
    ALTER SEQUENCE claims_id_seq OWNED BY claims.id;
    ALTER TABLE ONLY claims ALTER COLUMN id SET DEFAULT nextval('claims_id_seq'::regclass);

    CREATE UNIQUE INDEX address_idx ON claims ("btcoAddress")
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
