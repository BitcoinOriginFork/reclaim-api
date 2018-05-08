import { migrateDb, cleanDb } from '../utils/test_db'
import { expect } from 'chai'
import { setTestEnv } from '../utils/set_test_env'
import { openServer, closeServer } from '../utils/test_server'
const request = require('supertest')

describe('db.claims', () => {
  let server

  before(async () => {
    setTestEnv()
    await migrateDb()
  })

  beforeEach(async () => {
    server = await openServer()
  })

  afterEach(async () => {
    await closeServer(server)
    await cleanDb()
  })

  it('boots once and closes', (done) => {
    request(server)
      .get('/')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err)
        console.log(res.body)
        done()
      })
  })

  it('boots twice and closes', (done) => {
    request(server)
      .get('/')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err)
        console.log(res.body)
        done()
      })
  })
})
