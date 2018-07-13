import { migrateDb, cleanDb } from '../utils/test_db'
import { getClaimsByXboAddress, createPendingClaim, ClaimStatus } from './claims'
import { queryHandler } from './connection'
import { Client } from 'pg'
import { expect } from 'chai'
import { Chain } from '../crypto'
import { Claim } from '../services/process_claim'
import { setTestEnv } from '../utils/set_test_env'
import { getCurrencyBalance } from './balances'

describe('db.claims', () => {
  before(async () => {
    setTestEnv()
    await migrateDb()
  })

  afterEach(async () => {
    await cleanDb()
  })

  it('getClaimsByXboAddress returns an empty object if the claim does not exist', async () => {
    const res = await getClaimsByXboAddress('notAnAddress')
    expect(res).to.eql({})
  })

  it('createPendingClaim creates required records', async () => {
    // Create the balance record
    await queryHandler(async function (client: Client) {
      return client.query(`
        INSERT INTO currency_balances (currency_id, address, balance, block, created)
          VALUES ($1, $2, $3, $4, $5)
      `, [1, 'aChainAddress', 10, 2404, new Date()])
    })

    const claim: Claim = {
      chain: Chain.bitcoin,
      chainAddress: 'aChainAddress',
      claimToAddress: 'anAddress',
      message: 'aMessage',
      signature: 'aSignature'
    }

    await createPendingClaim(claim)

    const balance = await getCurrencyBalance(claim.chain, claim.chainAddress)
    const pendingClaim = await getClaimsByXboAddress('anAddress')
    expect(pendingClaim.signature).to.eql('aSignature')
    expect(pendingClaim.currency_balance_id).to.eql(balance.id)
    expect(pendingClaim.message).to.eql('aMessage')
    expect(pendingClaim.status).to.eql(ClaimStatus.pending)
  })
})
