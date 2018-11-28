import { ONE_TRX } from '../services/client'

export const SELL_VARIATION = 0.99
export const BUY_VARIATION = 1.01

/* GOTRON FORMULA */
const exchangeToSupply = (supply, balance, quant) => {
  let newBalance = balance + quant
  let issuedSupply = (-supply * (1.0 - Math.pow((1.0 + (quant / newBalance)), 0.0005)))
  return { supply: supply + issuedSupply, relay: issuedSupply }
}

const exchangeFromSupply = (supply, balance, supplyQuant) => {
  supply = supply - supplyQuant

  let exchangeBalance = balance * (Math.pow(1.0 + (supplyQuant / supply), 2000.0) - 1.0)

  return exchangeBalance
}

const exchangePrice = (firstBalance, secondBalance, quant, parseTrx = false) => {
  let supply = 1000000000000000000
  quant = parseFloat(quant)
  let { supply: newSupply, relay } = exchangeToSupply(supply, firstBalance, quant)
  let estimatedCost = exchangeFromSupply(newSupply, secondBalance, relay) / (parseTrx ? ONE_TRX : 1)

  return estimatedCost
}
/* GOTRON FORMULA */

export const estimatedBuyCost = (firstBalance, secondBalance, quant, parseTrx = false) => {
  const cost = exchangePrice(firstBalance, secondBalance, quant, parseTrx)
  return parseTrx
    ? cost * BUY_VARIATION
    : Math.ceil(cost * BUY_VARIATION)
}

export const estimatedSellCost = (firstBalance, secondBalance, quant, parseTrx = false) => {
  const cost = exchangePrice(firstBalance, secondBalance, quant, parseTrx)
  return parseTrx
    ? cost * SELL_VARIATION
    : Math.floor(cost * SELL_VARIATION)
}

export const expectedSell = (value, isTrx) => Math.round((isTrx ? ONE_TRX : 1) * value)
export const expectedBuy = (value, isTrx) => Math.round((isTrx ? ONE_TRX : 1) * value)
