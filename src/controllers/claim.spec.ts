import { migrateDb, cleanDb } from '../utils/test_db'
import { expect } from 'chai'
import { setTestEnv } from '../utils/set_test_env'
import { openServer, closeServer } from '../utils/test_server'
import { clone } from 'lodash'
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

  describe('/claim', () => {
    const claimBody = {
      signature: 'IIvOTTBHBkSh9Nq+f6VaIMieoS9nwxp8yUHaf4nNbaqpW0fjD3KU9D3Wm0yeSlbfmbynvgHfrfJnxMtHj/WgREY=',
      chain: 'bitcoin',
      address: '1Hw54G2iKy15VNiVF9y5rnaAYHZ5yV4Uzt',
      message: 'BTCO:0xa324718E0D122D7035b129bCF5936a5D673a6327'
    }

    it('submits a claim and returns the tx hash', (done) => {
      request(server)
        .post('/claim')
        .set('Accept', 'application/json')
        .send(claimBody)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body.txHash).to.eql('0x000')
          expect(res.body.success).to.eql(true)
          done()
        })
    })

    it('throws an error if the signature is invalid', (done) => {
      let invalidClaim = clone(claimBody)
      invalidClaim.signature = `P${invalidClaim.signature.slice(1, invalidClaim.signature.length)}`

      request(server)
        .post('/claim')
        .set('Accept', 'application/json')
        .send(invalidClaim)
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body.message).to.eql('Invalid signature parameter')
          done()
        })
    })

    it('throws an error if the message is of the wrong form', (done) => {
      let invalidClaim = clone(claimBody)
      invalidClaim.message = `incorrectMessageForm`

      request(server)
        .post('/claim')
        .set('Accept', 'application/json')
        .send(invalidClaim)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body.message).to.eql('Invalid message. Ensure the form is BTCO:YourClaimAddress')
          done()
        })
    })

    it('throws an error if the claim has already been submitted', (done) => {
      // First Request is successful
      request(server)
        .post('/claim')
        .set('Accept', 'application/json')
        .send(claimBody)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err)
        })

      // Second Request throws
      request(server)
        .post('/claim')
        .set('Accept', 'application/json')
        .send(claimBody)
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body.message).to.eql('Claim already exists')
          done()
        })
    })
  })

  describe('/claim/p2sh', () => {
    const claimBody = {
      signatures: [
        {
          signature: 'H1I441ZZw6SkcMC5m4AJTFh8LRTRx6stlWji0theZ+ywJTXLi17McPnYUZgZpnA6eXkyZGB92P0WarXCVkqmrd4=',
          address: '18FnLnRQQNeS7GFhSJKZ94MrtrzTjTCdd9',
          message: 'BTCO:0xa324718E0D122D7035b129bCF5936a5D673a6327'
        },
        {
          signature: 'H+DTo/q12t3SYsKVMMnqkMaW/4YRo0Ljtl0r26HKBnYpCJi9IZsvrtDDydoK42uFBDGW72CoVZVh4pwdz/pZ23U=',
          address: '19C9GRvESBu1dvsqDu4qDSCxotqfJa7BnB',
          message: 'BTCO:0xa324718E0D122D7035b129bCF5936a5D673a6327'
        },
      ],
      chain: 'bitcoin',
      redeemScript: '522103ba589daeef1a2a3fb780973b4ff9ec412c12777179c235b57524c16fd08e61ed2102c7d2a24de66ddaf68e7672ff210c4b2750adbd5b9a7ca4f85c8154c20e957d1c52ae'
    }

    it('submits a multisig claim when presented with the redeem script', (done) => {
      request(server)
        .post('/claim/p2sh')
        .set('Accept', 'application/json')
        .send(claimBody)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err)
          expect(res.body.txHash).to.eql('0x000')
          expect(res.body.success).to.eql(true)
          done()
        })
    })
  })
})
