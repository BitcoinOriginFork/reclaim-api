import { Chain } from '../crypto'

// TODO: Update
export interface DbClaim {
  id?: number
  xbo_address: string
  signature: string
  message: string
  status: string
  created: Date
  updated: Date
}
