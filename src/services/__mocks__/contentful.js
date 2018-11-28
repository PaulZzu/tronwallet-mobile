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
  const total = 0
  const featured = []
  const assets = []
  const allAssets = []

  return { featured, assets, allAssets, totalTokens: total }
}

export const queryToken = async (verifiedOnly = false, name = '', params = defaultParams) => {
  const total = 0
  const results = []

  return { total, results }
}

export const getFixedTokens = async () => {
  const fixedNames = []
  return ['TRX', ...fixedNames]
}

export const getSystemStatus = async () => {
  const fields = {
    showStatus: false,
    statusMessage: '0',
    statusColor: '',
    messageColor: '',
    systemAddress: '00000'
  }

  return {
    systemStatus: fields,
    systemAddress: fields.systemAddress
  }
}
