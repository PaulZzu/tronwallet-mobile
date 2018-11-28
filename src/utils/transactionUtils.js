import RNTron from 'react-native-tron'
import { Linking } from 'react-native'

import tl from '../utils/i18n'
import { TronVaultURL } from './deeplinkUtils'
import getTransactionStore from '../store/transactions'
import Client, { ONE_TRX } from '../services/client'
import { logSentry } from '../utils/sentryUtils'

export const signTransaction = async (privateKey, transactionUnsigned) => {
  try {
    const transactionSigned = await RNTron.signTransaction(
      privateKey,
      transactionUnsigned
    )
    return transactionSigned
  } catch (error) {
    logSentry(error, 'Signing Transaction')
  }
}

export const updateTransactions = async (address) => {
  const transactions = await Client.getTransactionsList(address)
  const store = await getTransactionStore()
  store.write(() =>
    transactions.map(item => {
      const transaction = createTransaction(item, address)
      store.create('Transaction', transaction, true)
    })
  )
}

export const updateTransactionByHash = async (hash, address) => {
  const item = await Client.getTransactionByHash(hash)
  if (item.confirmed) {
    const transaction = createTransaction(item, address)
    const store = await getTransactionStore()
    store.write(() => {
      store.create('Transaction', transaction, true)
    })
  }
}

const createTransaction = (item, address) => {
  const blockNumber = item.block ? item.block.number : null
  const transaction = {
    id: item.hash,
    type: item.type,
    contractData: {},
    ownerAddress: address,
    confirmed: true,
    block: blockNumber,
    timestamp: new Date(item.createdAt).getTime()
  }
  if (item.type === 'Transfer') {
    transaction.id = item.hash
    transaction.contractData = {
      transferFromAddress: item.ownerAddress,
      transferToAddress: item.toAddress,
      amount: item.amount,
      tokenName: item.assetName || 'TRX'
    }
  }
  if (item.type === 'Create') {
    transaction.contractData = {
      tokenName: item.name,
      unityValue: item.trxNum,
      totalSupply: item.totalSupply,
      startTime: item.startTime,
      endTime: item.endTime,
      description: item.description
    }
  }
  if (item.type === 'Participate') {
    transaction.contractData = {
      tokenName: item.assetName,
      transferFromAddress: item.toAddress,
      amount: item.amount
    }
  }
  if (item.type === 'Freeze') {
    transaction.contractData = {
      frozenBalance: item.frozenBalance
    }
  }
  if (item.type === 'Vote') {
    transaction.contractData = {
      votes: item.votesList
    }
  }
  if (item.type === 'Exchange') {
    transaction.contractData = {
      amount: item.quant / (item.tokenId === '_' ? ONE_TRX : 1),
      tokenName: item.tokenId === '_' ? 'TRX' : item.tokenId
    }
  }

  return transaction
}

export const getTranslatedType = (type) => {
  switch (type) {
    case 'Transfer':
      return tl.t('transactionType.transfer')
    case 'Transfer Asset':
      return tl.t('transactionType.transferAsset')
    case 'Freeze':
      return tl.t('transactionType.freeze')
    case 'Unfreeze':
      return tl.t('transactionType.unfreeze')
    case 'Vote':
      return tl.t('transactionType.vote')
    case 'Participate':
      return tl.t('transactionType.participate')
    case 'Create':
      return tl.t('transactionType.create')
    case 'Exchange':
      return tl.t('transactionType.exchange')
    default:
      return tl.t('transactionType.undefined')
  }
}

export const openDeepLink = async dataToSend => {
  const url = `${TronVaultURL}auth/${dataToSend}`
  return Linking.openURL(url)
}

export const getTokenPriceFromStore = (tokenName, assetStore) => {
  const filtered = assetStore
    .objects('Asset')
    .filtered(
      `name == '${tokenName}'`
    )
    .map(item => Object.assign({}, item))

  if (filtered.length) {
    return filtered[0].price
  }

  return ONE_TRX
}
