# Reclaim API

## Primary Purpose
* Validate claim signatures of the top 5 PoW currencies
* Store records in a RDS for reference
* Submit to claim contract

## Running the tests
`sh utils/start_test_dbs.sh`
`npm test`

## Usage

### Submit Claim

POST localhost:3000/claim
```
{
  "message": "BTCO:0xa324718E0D122D7035b129bCF5936a5D673a6327",
  "chain": "ethereum",
  "address": "0x086e1e0ea39917d78ff1d6fe77a0747b4d2689b6",
  "signature": "0x4d7de2425359a758fe2d4c98ec2febf398a054fa15a1e1b87278da0b2b4e56ee5ee0d31031ba1ff712ba08455e0c782cc4e4ff2f4da10ce1cacd83e20b511fb91c"
}
```

### Test Signature

#### ETH Signature Generation
https://www.myetherwallet.com/signmsg.html

#### ETH
0x086e1e0ea39917d78ff1d6fe77a0747b4d2689b6
0x4d7de2425359a758fe2d4c98ec2febf398a054fa15a1e1b87278da0b2b4e56ee5ee0d31031ba1ff712ba08455e0c782cc4e4ff2f4da10ce1cacd83e20b511fb91c
BTCO:0xa324718E0D122D7035b129bCF5936a5D673a6327

#### BTC (original)
1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN
XBO:0xf5f6b9ec85edccc196705ce1f80d490d7f6a709d
G3uMIOajRBg4sWEMZkPKB7S3I2RR52W/Y11beYYcD9TpTwhnOEtz/BDvnEBiNy0uMkzHNDBHmQFvAXreBppVeDg=

#### BTC (segwit) -- Interestingly the the non segwit address was returned by the signing tool...
1GBdawQ21UeZoGGQC984UyrPhfGJMvjuZy
BTCO:0x61A0bFB2c98d0442431064c8C6aff4bC67F257c0
IJHRNl6y62ZuFJd1ci4zOSLtZOFgJ4HJc4QbWAprw/Q5S+2d7pljyj4w/dwEjZPg7B2aGK8pSuoUZT7difAt7P0=

#### BTC MultiSig
Pubkey 1: 03ba589daeef1a2a3fb780973b4ff9ec412c12777179c235b57524c16fd08e61ed
Pubkey 2: 02c7d2a24de66ddaf68e7672ff210c4b2750adbd5b9a7ca4f85c8154c20e957d1c
Sigs required: 2
Payment Address: 3BMKnpSGYCasZAQmTSRcPi3fGnfFJw7Nuw
Redeem Script: 522103ba589daeef1a2a3fb780973b4ff9ec412c12777179c235b57524c16fd08e61ed2102c7d2a24de66ddaf68e7672ff210c4b2750adbd5b9a7ca4f85c8154c20e957d1c52ae

### Dash

### Litecoin
LRKKuqGcQnjsUUGb8t3pRoJrTM2d4A9J3k
BTCO:0x61A0bFB2c98d0442431064c8C6aff4bC67F257c0
H0y5dKOegiRTfZ2837yumuiGCvg9rs/Muy7L+4Dlok6RApyGksItScH4BfCCmJmKZ3uqEqJVxbEIPPXz9GjMkXE=
