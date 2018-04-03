export interface Claim {
  id?: number
  btcoAddress: string
  signature: string
  status: string
  createdAt: Date
  updatedAt: Date
}
