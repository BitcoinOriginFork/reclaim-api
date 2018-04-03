import { migrateDb, cleanDb } from '../utils/test_db'
import { getClaimByBtcoAddress, createClaim, ClaimStatus } from './claims'
import { queryHandler } from './connection'
import { Client } from 'pg'
import { expect } from 'chai'

describe('db.claims', () => {
  before(async () => {
    await migrateDb()
  })

  beforeEach(async () => {
    await cleanDb()
  })

  it('getClaimByBtcoAddress returns an empty object if the claim does not exist', async () => {
    const res = await getClaimByBtcoAddress('notAnAddress')
    expect(res).to.eql({})
  })

  it('getClaimByBtcoAddress returns a user when they exist', async () => {
    await createClaim('anAddress', 'aSignature')

    const res = await getClaimByBtcoAddress('anAddress')
    expect(res.signature).to.eql('aSignature')
    expect(res.status).to.eql(ClaimStatus.pending)
  })
})
