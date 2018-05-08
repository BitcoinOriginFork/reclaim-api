import { Chain } from '../crypto'

export interface DbClaim {
  id?: number
  btcoAddress: string
  signature: string
  chain: Chain
  chainAddress: string
  message: string
  status: string
  createdAt: Date
  updatedAt: Date
}
