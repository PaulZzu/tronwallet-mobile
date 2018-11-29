import { createClient } from 'contentful/dist/contentful.browser.min.js'
import { CONTENTFUL_TOKEN, CONTENTFUL_SPACE } from '../../config.js'

export default createClient({ accessToken: CONTENTFUL_TOKEN, space: CONTENTFUL_SPACE })
