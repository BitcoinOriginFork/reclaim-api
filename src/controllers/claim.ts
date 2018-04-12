import { Request, Response } from 'express'
import { createClaim, getClaimByBtcoAddress } from '../db/claims'
import { Chain, validateClaim } from '../crypto'

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
    const btcoAddress = req.body.btcoAddress
    const signature = req.body.signature
    const chain: Chain = req.body.chain
    const chainAddress = req.body.signature
    const message = req.body.signature

    if (!btcoAddress || !signature || !chain || !chainAddress || !message) {
      res.status(400).json({message: 'Missing field'})
      return
    }

    const validClaim = validateClaim(btcoAddress, chain, chainAddress, message, signature)
    if (!validClaim) {
      res.status(400).json({message: 'Invalid claim'})
    }

    const claim = await createClaim(btcoAddress, signature, chain, chainAddress, message)
    res.status(201).json(claim)
  } catch (e) {
    console.error(e)
    next(e)
  }
}
