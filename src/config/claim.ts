export function claimCreds (): {endpoint: string, xboContractAddress: string, xboPrivateKey: string} {
  const endpoint = process.env.ETH_ENDPOINT
  const xboContractAddress = process.env.CONTRACT_ADDRESS
  const xboPrivateKey = process.env.CLAIM_PRIVATE_KEY

  if (!endpoint || !xboContractAddress || !xboPrivateKey) {
    throw new Error('Missing credentials for claiming')
  }

  return {endpoint, xboContractAddress, xboPrivateKey}
}
