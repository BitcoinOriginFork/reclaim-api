import { Request, Response } from 'express'
import { createClaim, getClaimsByxboAddress } from '../db/claims'
import { Chain, validateClaim, validEthAddress, parseP2shMultisigScript } from '../crypto'
import { uniq, includes } from 'lodash'
import { Claim, processClaim } from '../services/process_claim'

export async function getClaim (req: Request, res: Response, next: Function) {
  try {
    const xboAddress = req.body.xboAddress
    const claims = await getClaimsByxboAddress(xboAddress)
    res.status(200).json(claims)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

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

    const xboAddress = message.split(':')[1]

    const claim: Claim = {
      chain: chain,
      chainAddress: address,
      claimToAddress: xboAddress,
      message: message,
      signature: signature
    }

    const validClaimToAddress = validEthAddress(xboAddress)
    if (!validClaimToAddress) {
      res.status(400).json({message: 'Invalid message. Ensure the form is xbo:YourClaimAddress'})
      return
    }

    const validClaim = validateClaim(chain, address, message, signature)
    if (!validClaim) {
      res.status(400).json({message: 'Invalid claim'})
      return
    }

    const submittedClaim = await processClaim(claim)
    res.status(201).json(submittedClaim)
  } catch (e) {
    next({message: e.message ? e.message : e })
  }
}

export interface SignatureForValidation {
  signature: string
  address: string
  message: string
}

export async function postMultisigClaim (req: Request, res: Response, next: Function) {
  try {
    const signatures: SignatureForValidation[] = req.body.signatures
    const chain: Chain = req.body.chain
    const redeemScript: string = req.body.redeemScript

    if (!signatures || !signatures.length || !chain || !redeemScript) {
      res.status(400).json({message: 'Missing field'})
      return
    }

    // Ensure all of the messages on the sigs for validation are the same
    const messages = signatures.map(s => s.message)
    const uniqMessage = uniq(messages)
    if (uniqMessage.length > 1) {
      res.status(400).json({message: 'Invalid messages. All signatxboes must sign the same message.'})
      return
    }

    const xboAddress = messages[0].split(':')[1]
    const validClaimToAddress = validEthAddress(xboAddress)
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

    const claim: Claim = {
      chain: chain,
      chainAddress: scriptInfo.scriptAddress,
      claimToAddress: xboAddress,
      message: signatures.map(s => s.message).join(':'),
      signature: signatures.map(s => s.signature).join(':')
    }

    const submittedClaim = await processClaim(claim)
    res.status(201).json(submittedClaim)
  } catch (e) {
    console.error(e)
    next(e)
  }
}
