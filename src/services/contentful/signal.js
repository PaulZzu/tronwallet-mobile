import get from 'lodash/get'

import contentfulClient from './../contentfulClient'

function parseResults (list = []) {
  if (list.length === 0) {
    return []
  }
  const resultList = []
  list.forEach(item => {
    resultList.push(
      Object.assign({}, item.fields, item.sys)
    )
  })

  return resultList
}

function parseTokenLogo (list = []) {
  if (list.length === 0) {
    return []
  }

  const resultList = []
  list.forEach(item => {
    if (item.tokenLogo) {
      const imageURL = get(item, 'tokenLogo.fields.file.url', null)
      resultList.push(
        Object.assign({}, item, { tokenLogo: `https:${imageURL}` })
      )
    }
  })

  return resultList
}

export function getList (skip, limit) {
  const queryEntry = {
    content_type: 'signals',
    select: 'sys.id,sys.updatedAt,fields.message,fields.title,fields.tokenLogo,fields.tokenName',
    limit,
    skip,
    order: '-sys.updatedAt'
  }
  return contentfulClient.getEntries(queryEntry)
    .then(data => data.items)
    .then(parseResults)
    .then(parseTokenLogo)
    .catch(err => {
      console.log(err)
      return []
    })
}

// 0:
//   fields:
//   message: "Hello TronWallet Signals"
//   title: "Hello TronWallet Signals"
//   tokenLogo: { sys: { … }, fields: { … } }
//   tokenName: "TWX"
//   sys: { id: "3JFOEBwH1mAwsmmmguM8Yw" }

// 1:
//   fields: { message: "Hello TronWallet Signals 2", title: " Hello TronWallet Signals 2", tokenLogo: { … }, tokenName: "TWX" }
//   sys: { id: "1QesTyWarKsScQEGuUQsyC" }

// tokenLogo:
// fields:
// file: {
//   url: "//images.ctfassets.net/u26tmkqoc2fn/d1wJ9jMHrUgUSK…2467dd2ba9fc04a7bda0f90db/tronwallet-logo-xxl.png",
//     details: { … },
//   fileName: "tronwallet-logo-xxl.png",
//     contentType: "image/png"
// }
//   title: "tronwallet-logo-xxl"
