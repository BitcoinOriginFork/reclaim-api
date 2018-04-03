import { Request, Response } from 'express'
import { createClaim, getClaimByBtcoAddress } from '../db/claims'

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
    const claim = await createClaim(btcoAddress, signature)
    res.status(201).json(claim)
  } catch (e) {
    console.error(e)
    next(e)
  }
}
