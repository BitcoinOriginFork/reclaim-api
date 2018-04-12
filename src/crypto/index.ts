const EthJS = require('ethereumjs-util')
const bitcoinMessage = require('bitcoinjs-message')

export enum Chain {
  bitcoin = 'bitcoin',
  bitcoinCash = 'bitcoinCash',
  litecoin = 'litecoin',
  ethereum = 'ethereum',
  dash = 'dash'
}

export function validateClaim(btcoAddress: string, chain: Chain, address: string, message: string, signature: string) {
  if (chain === Chain.ethereum) {
    return validateEthClaim(btcoAddress, address, message, signature)
  } else {
    return validateBtcLikeClaim(address, message, signature)
  }
}

export function validateBtcLikeClaim(address: string, message: string, signature: string): boolean {
  return bitcoinMessage.verify(message, address, signature)
}

export function validateEthClaim(btcoAddress: string, address: string, message: string, signature: string): boolean {
  const {v, r, s} = EthJS.fromRpcSig(signature)
  const hashedMessage = EthJS.hashPersonalMessage(message)
  const publicKey = EthJS.ecrecover(hashedMessage, v, r, s)
  return EthJS.pubToAddress(publicKey) === btcoAddress
}

export function validEthAddress(address: string) {
  return EthJS.isValidAddress(address)
}
