import { xboAbi } from '../services/xbo_abi'
import { Request, Response } from 'express'

export async function getXboContractDetails (req: Request, res: Response) {
  const details = {
    address: process.env.CONTRACT_ADDRESS,
    abi: xboAbi
  }

  res.status(200).json(details)
}
