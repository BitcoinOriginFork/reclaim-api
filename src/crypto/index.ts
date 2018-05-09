const EthJS = require('ethereumjs-util')
const bitcoinMessage = require('bitcoinjs-message')
const litecoinMessage = require('litecore-message')
import * as bitcoin from 'bitcoinjs-lib'

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

// Understanding a decompiled multisig script
// [ele - 80 = required sigs, buffer = sig1, buffer = sig2..., ele - 80 = number of sigs, 174 = OP_CHECKMULTISIG]
export function parseP2shMultisigScript (script: string, chain: Chain): {required: number, addresses: string[], scriptAddress: string} {
  const redeemScript = Buffer.from(script, 'hex')
  const scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript))
  const scriptAddress = bitcoin.address.fromOutputScript(scriptPubKey)
  const scriptChunks: any = bitcoin.script.decompile(redeemScript)

  if (scriptChunks[scriptChunks.length - 1] !== 174) {
    throw new Error(`Wrong OP Code. Multisig code is 174. This script has ${scriptChunks[scriptChunks.length]}`)
  }

  const requiredSigs = scriptChunks[0] - 80
  const numberOfSigs = scriptChunks.length - 3

  const pubKeyBuffers = scriptChunks.slice(1, numberOfSigs + 1)
  const network = chain === Chain.litecoin ? bitcoin.networks.litecoin : bitcoin.networks.bitcoin
  const addresses = pubKeyBuffers.map((b: Buffer) => bitcoin.ECPair.fromPublicKeyBuffer(b, network).getAddress())

  return { required: requiredSigs, addresses, scriptAddress}
}
