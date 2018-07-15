import { expect } from 'chai'
import { openServer, closeServer } from '../utils/test_server'
const request = require('supertest')
import { setTestEnv } from '../utils/set_test_env'

describe('controllers.xbo', () => {
  let server

  beforeEach(async () => {
    server = await openServer()
    setTestEnv()
  })

  afterEach(async () => {
    await closeServer(server)
  })

  describe('/contract/xbo', () => {
    it('retrieves the details of the contract', (done) => {
      request(server)
        .get('/contract/xbo')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body.address).to.eql('0x9538AF54A12e3bD8079148E659007b9E99Cb72A9')
          expect(res.body.abi).to.not.eql('')
          done()
        })
    })
  })
})
