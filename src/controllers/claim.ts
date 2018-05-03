import { Request, Response } from 'express'
import { createClaim, getClaimByBtcoAddress } from '../db/claims'
import { Chain, validateClaim, validEthAddress, parseP2shMultisigScript } from '../crypto'
import { uniq, includes } from 'lodash'

export async function getClaim (req: Request, res: Response, next: Function) {
  try {
    const btcoAddress = req.body.btcoAddress
    const claim = await getClaimByBtcoAddress(btcoAddress)

    if (!claim) return res.status(404).json({message: 'Resource not found'})

    res.status(200).json(claim)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

// TODO: Improve the error handling here. createClaim will throw if a claim already
// exists against the btcoAddress. This should produce a human readable error
export async function postClaim (req: Request, res: Response, next: Function) {
  try {
    const signature = req.body.signature
    const chain: Chain = req.body.chain
    const address = req.body.address
    const message = req.body.message

    if (!signature || !chain || !address || !message) {
      res.status(400).json({message: 'Missing field'})
      return
    }

    const btcoAddress = message.split(':')[1]
    const validClaimToAddress = validEthAddress(btcoAddress)
    if (!validClaimToAddress) {
      res.status(400).json({message: 'Invalid message. Ensure the form is BTCO:YourClaimAddress'})
      return
    }

    const validClaim = validateClaim(chain, address, message, signature)
    if (!validClaim) {
      res.status(400).json({message: 'Invalid claim'})
      return
    }

    const claim = await createClaim(btcoAddress, signature, chain, address, message)

    // TODO: Submit claim to smart contract

    res.status(201).json(claim)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export interface SignatureForValidation {
  signature: string
  address: string
  message: string
}

// TODO: Untested
export async function postMultisigClaim (req: Request, res: Response, next: Function) {
  try {
    const signatures: SignatureForValidation[] = req.body.signatures
    const chain: Chain = req.body.chain
    const redeemScript: string = req.body.redeemScript

    if (!signatures || !signatures.length || !chain || redeemScript) {
      res.status(400).json({message: 'Missing field'})
      return
    }

    // Ensure all of the messages on the sigs for validation are the same
    const messages = signatures.map(s => s.message)
    const uniqMessage = uniq(messages)
    if (uniqMessage.length > 1) {
      res.status(400).json({message: 'Invalid messages. All signatories must sign the same message.'})
      return
    }

    const btcoAddress = messages[0].split(':')[1]
    const validClaimToAddress = validEthAddress(btcoAddress)
    if (!validClaimToAddress) {
      res.status(400).json({message: 'Invalid message. Ensure the form is BTCO:YourClaimAddress'})
      return
    }

    const validClaims = signatures.map(s => validateClaim(chain, s.address, s.message, s.signature))
    const uniqClaimResult = uniq(validClaims)
    if (uniqClaimResult.length > 1 || uniqClaimResult[0] !== true) {
      res.status(400).json({message: 'One of the signed messages was invalid'})
      return
    }

    const scriptInfo = parseP2shMultisigScript(redeemScript, chain)

    // To validate our signatures against the redeemScript we need to ensure
    // 1. That the validated addresses provided are listed by the redeem script
    // 2. That the correct number of signatures have been provided
    const addresses = signatures.map(s => s.address)
    const addressesOnScript = addresses.filter(a => includes(scriptInfo.addresses, a))
    if (addressesOnScript.length < scriptInfo.required) {
      res.status(400).json({message: 'Enough signatures were not provided'})
      return
    }

    // Shall we just store the first signature and message... maybe
    const claim = await createClaim(btcoAddress, signatures[0].signature, chain, scriptInfo.scriptAddress, messages[0])

    // TODO: Submit claim to smart contract

    res.status(201).json(claim)
  } catch (e) {
    console.error(e)
    next(e)
  }
}
