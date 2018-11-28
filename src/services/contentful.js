import { createClient } from 'contentful/dist/contentful.browser.min.js'
import { CONTENTFUL_TOKEN, CONTENTFUL_SPACE } from '../../config.js'

const contentfulClient = createClient({accessToken: CONTENTFUL_TOKEN, space: CONTENTFUL_SPACE})

const SYSTEM_CONTENT = '11bJZFl0J6CMEwoMi20sqC'

const defaultParams = {
  content_type: 'asset',
  order: '-fields.isFeatured,-fields.isVerified,fields.position,-fields.issuedPercentage',
  'fields.isListed': true,
  'fields.issuedPercentage[lt]': 100,
  'fields.startTime[lt]': Date.now(),
  'fields.endTime[gte]': Date.now()
}

export const BATCH_NUMBER = 30

export const getTokens = async (verifiedOnly = false, start = 0) => {
  const queryEntry = {
    ...defaultParams,
    skip: start,
    limit: BATCH_NUMBER
  }

  if (verifiedOnly) queryEntry['fields.isVerified'] = true

  const { total, items: featuredTokens } = await contentfulClient.getEntries(queryEntry)
  const featured = []
  const assets = []
  const allAssets = []
  featuredTokens.map(({sys: { id: contentfulId }, fields: token}) => {
    const asset = {...token, contentfulId}
    if (token.isFeatured) {
      const image = token.featuredCover ? `https:${token.featuredCover.fields.file.url}` : null
      featured.push({...asset, image})
      allAssets.push({...asset, image})
    } else {
      allAssets.push(asset)
      assets.push(asset)
    }
  })
  return {featured, assets, allAssets, totalTokens: total}
}

export const queryToken = async (verifiedOnly = false, name = '', params = defaultParams) => {
  const queryEntry = {
    ...params,
    'fields.name[match]': name,
    limit: 5
  }
  if (verifiedOnly) queryEntry['fields.isVerified'] = true

  const { total, items: assets } = await contentfulClient.getEntries(queryEntry)
  const results = assets.map(({fields}) => fields)
  return { total, results }
}

export const getFixedTokens = async () => {
  const queryEntry = {
    content_type: 'asset',
    order: '-fields.isFeatured,fields.position',
    select: 'fields.name',
    'fields.isVerified': true
  }

  const { items: featuredTokens } = await contentfulClient.getEntries(queryEntry)
  const fixedNames = featuredTokens.map(({fields: token}) => token.name)
  return ['TRX', ...fixedNames]
}

export const getSystemStatus = async () => {
  const systemEntry = await contentfulClient.getEntry(SYSTEM_CONTENT)
  const { fields: { showStatus, statusMessage, statusColor, messageColor, systemAddress } } = systemEntry
  return {
    systemStatus: { showStatus, statusMessage, statusColor, messageColor },
    systemAddress
  }
}

export const getExchangesAvailable = async () => {
  const queryEntry = { content_type: 'exchange' }
  const { items: exchangesAvailable } = await contentfulClient.getEntries(queryEntry)
  return exchangesAvailable.map(({fields: ex}) => {
    const firstTokenImage = ex.firstTokenImage ? `https:${ex.firstTokenImage.fields.file.url}` : null
    const secondTokenImage = ex.secondTokenImage ? `https:${ex.secondTokenImage.fields.file.url}` : null
    return ({
      exchangeId: ex.exchangeId,
      firstTokenImage,
      secondTokenImage
    })
  })
}
