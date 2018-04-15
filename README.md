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
1Hw54G2iKy15VNiVF9y5rnaAYHZ5yV4Uzt
BTCO:0xa324718E0D122D7035b129bCF5936a5D673a6327
IIvOTTBHBkSh9Nq+f6VaIMieoS9nwxp8yUHaf4nNbaqpW0fjD3KU9D3Wm0yeSlbfmbynvgHfrfJnxMtHj/WgREY=

#### BTC (segwit) -- Interestingly the the non segwit address is used
1GBdawQ21UeZoGGQC984UyrPhfGJMvjuZy
BTCO:0x61A0bFB2c98d0442431064c8C6aff4bC67F257c0
IJHRNl6y62ZuFJd1ci4zOSLtZOFgJ4HJc4QbWAprw/Q5S+2d7pljyj4w/dwEjZPg7B2aGK8pSuoUZT7difAt7P0=

### Dash

### Litecoin
LRKKuqGcQnjsUUGb8t3pRoJrTM2d4A9J3k
BTCO:0x61A0bFB2c98d0442431064c8C6aff4bC67F257c0
H0y5dKOegiRTfZ2837yumuiGCvg9rs/Muy7L+4Dlok6RApyGksItScH4BfCCmJmKZ3uqEqJVxbEIPPXz9GjMkXE=
