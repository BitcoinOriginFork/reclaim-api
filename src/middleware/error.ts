import { Request, Response } from 'express'

export function errorHandler (err: Error, req: Request, res: Response, next: Function) {
  const message = err.message
  return res.status(500).json({message})
}
