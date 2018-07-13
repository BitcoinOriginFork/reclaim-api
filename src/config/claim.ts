export function claimCreds (): {endpoint: string, xboContractAddress: string, xboPrivateKey: string, xboAddress: string} {
  const endpoint = process.env.ETH_ENDPOINT
  const xboContractAddress = process.env.CONTRACT_ADDRESS
  const xboPrivateKey = process.env.CLAIM_PRIVATE_KEY
  const xboAddress = process.env.CLAIM_ADDRESS

  if (!endpoint || !xboContractAddress || !xboPrivateKey || !xboAddress) {
    throw new Error('Missing credentials for claiming')
  }

  return {endpoint, xboContractAddress, xboPrivateKey, xboAddress}
}
