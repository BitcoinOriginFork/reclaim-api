const EthJS = require('ethereumjs-util')
const bitcoinMessage = require('bitcoinjs-message')
const litecoinMessage = require('litecore-message')

export enum Chain {
  bitcoin = 'bitcoin',
  bitcoinCash = 'bitcoinCash',
  litecoin = 'litecoin',
  ethereum = 'ethereum',
  dash = 'dash'
}

export function validateClaim(chain: Chain, address: string, message: string, signature: string) {
  switch (chain) {
    case Chain.ethereum:
      return validateEthClaim(address, message, signature)
    case Chain.litecoin:
      return validateLitecoinClaim(address, message, signature)
    default:
      return validateBtcLikeClaim(address, message, signature)
  }
}

export function validateBtcLikeClaim(address: string, message: string, signature: string): boolean {
  return bitcoinMessage.verify(message, address, signature)
}

export function validateLitecoinClaim(address: string, message: string, signature: string): boolean {
  return litecoinMessage(message).verify(address, signature)
}

export function validateEthClaim(address: string, message: string, signature: string): boolean {
  const {v, r, s} = EthJS.fromRpcSig(signature)
  const messageInBuffer = EthJS.toBuffer(message)
  const hashedMessage = EthJS.hashPersonalMessage(messageInBuffer)
  const publicKey = EthJS.ecrecover(hashedMessage, v, r, s)
  return EthJS.bufferToHex(EthJS.pubToAddress(publicKey)) === address
}

export function validEthAddress(address: string) {
  return EthJS.isValidAddress(address)
}
