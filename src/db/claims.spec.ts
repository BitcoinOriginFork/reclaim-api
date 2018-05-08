import { migrateDb, cleanDb } from '../utils/test_db'
import { getClaimByBtcoAddress, createClaim, ClaimStatus } from './claims'
import { queryHandler } from './connection'
import { Client } from 'pg'
import { expect } from 'chai'
import { Chain } from '../crypto'
import { Claim } from '../services/queue'
import { setTestEnv } from '../utils/set_test_env'

describe('db.claims', () => {
  before(async () => {
    setTestEnv()
    await migrateDb()
  })

  beforeEach(async () => {
    await cleanDb()
  })

  it('getClaimByBtcoAddress returns an empty object if the claim does not exist', async () => {
    const res = await getClaimByBtcoAddress('notAnAddress')
    expect(res).to.eql({})
  })

  it('getClaimByBtcoAddress returns a claim when it exists', async () => {
    const claim: Claim = {
      chain: Chain.bitcoin,
      chainAddress: 'aChainAddress',
      claimToAddress: 'anAddress',
      message: 'aMessage',
      signature: 'aSignature'
    }

    await createClaim(claim)

    const res = await getClaimByBtcoAddress('anAddress')
    expect(res.signature).to.eql('aSignature')
    expect(res.chain).to.eql('bitcoin')
    expect(res.chainAddress).to.eql('aChainAddress')
    expect(res.message).to.eql('aMessage')
    expect(res.status).to.eql(ClaimStatus.pending)
  })
})
