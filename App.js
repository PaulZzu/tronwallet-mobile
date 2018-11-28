import React, { Component } from 'react'
import { StatusBar, Platform, YellowBox, AsyncStorage, View } from 'react-native'
import axios from 'axios'
import Config from 'react-native-config'
import OneSignal from 'react-native-onesignal'
import Mixpanel from 'react-native-mixpanel'
import { Sentry } from 'react-native-sentry'
import has from 'lodash/has'

import { logSentry } from './src/utils/sentryUtils'
import RootNavigator from './Router'
import StatusMessage from './src/components/StatusMessage'
import { Colors } from './src/components/DesignSystem'

import Client from './src/services/client'
import { Context } from './src/store/context'
import NodesIp from './src/utils/nodeIp'
import { getUserSecrets } from './src/utils/secretsUtils'
import getBalanceStore from './src/store/balance'
import { USER_PREFERRED_CURRENCY, ALWAYS_ASK_PIN, USE_BIOMETRY, TOKENS_VISIBLE } from './src/utils/constants'
import { ONE_SIGNAL_KEY, MIXPANEL_TOKEN } from './config'
import ConfigJson from './package.json'

import { getFixedTokens, getSystemStatus } from './src/services/contentful'
// import './ReactotronConfig'

if (!__DEV__) {
  Sentry.config('https://8ffba48a3f30473883ba930c49ab233d@sentry.io/1236809', {
    disableNativeIntegration: Platform.OS === 'android',
    release: ConfigJson.version
  }).install()
}
Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN)

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'])

const prefix = Platform.OS === 'android' ? 'tronwalletmobile://tronwalletmobile/' : 'tronwalletmobile://'

class App extends Component {
  state = {
    price: {},
    freeze: {},
    balances: {},
    accounts: [],
    userSecrets: [],
    publicKey: null,
    pin: null,
    oneSignalId: null,
    shareModal: false,
    queue: null,
    alwaysAskPin: true,
    useBiometry: false,
    currency: null,
    secretMode: 'mnemonic',
    verifiedTokensOnly: true,
    fixedTokens: [],
    systemAddress: {},
    systemStatus: { showStatus: false, statusMessage: '', statusColor: '', messageColor: '' },
    signals: {}
  }

  componentDidMount () {
    setTimeout(() => {
      OneSignal.init(ONE_SIGNAL_KEY)
      OneSignal.inFocusDisplaying(2)
      OneSignal.addEventListener('ids', this._onIds)
      OneSignal.addEventListener('opened', this._onOpened)
      OneSignal.addEventListener('received', this._onReceived)
      OneSignal.configure()
    }, 1000)

    this._updateSystemStatus()
    this._setNodes()
    this._loadAskPin()
    this._loadUseBiometry()
    this._loadVerifiedTokenFlag()
    this._loadFixedTokens()
    this._loadCurrency()
  }

  componentWillUnmount () {
    OneSignal.removeEventListener('ids', this._onIds)
    OneSignal.removeEventListener('opened', this._onOpened)
    OneSignal.removeEventListener('received', this._onReceived)
  }

  _onIds = device => {
    // console.log('Device info: ', device)
    this.setState({ oneSignalId: device.userId })
  }

  _onReceived = notification => {
    // console.log('Notification received: ', notification)
  }

  _onOpened = openResult => {
    // console.log('Message: ', openResult.notification.payload.body)
    // console.log('Data: ', openResult.notification.payload.additionalData)
    // console.log('isActive: ', openResult.notification.isAppInFocus)
    // console.log('openResult: ', openResult)
  }

  _loadUserData = async () => {
    // accounts = filtered accounts by hidden status
    // userSecrets =  ref to all userSecrets
    let accounts = await getUserSecrets(this.state.pin)
    const userSecrets = accounts
    // First Time
    if (!accounts.length) return

    // merge store with state
    accounts = accounts
      .filter(account => !account.hide)
      .map(account => {
        const stateAccount = this.state.accounts.find(item => item.address === account.address)
        return Object.assign({}, stateAccount, account)
      })

    const publicKey = this.state.publicKey || accounts[0].address
    Mixpanel.identify(publicKey)
    this.setState({ accounts, userSecrets, publicKey }, () => this._updateAccounts(accounts))
  }

  _updateAccounts = async (accountsArray = []) => {
    const accountDataArray = await Promise.all(accountsArray.map(acc => Client.getAccountData(acc.address)))
    const updatedBalanceData = {}
    const updatedFreezeData = {}
    const updatedAccounDataArray = accountsArray.map((prevAccount, index) => {
      const { balanceTotal, freezeData, balancesData } = accountDataArray
        .find(ada => ada.address === prevAccount.address)

      updatedBalanceData[prevAccount.address] = balancesData
      updatedFreezeData[prevAccount.address] = freezeData

      prevAccount.balance = balanceTotal
      prevAccount.tronPower = freezeData.total
      prevAccount.bandwidth = freezeData.bandwidth.netRemaining + freezeData.bandwidth.freeNetRemaining

      getBalanceStore().then(store => {
        store.write(() => {
          balancesData.map(item =>
            store.create('Balance', {
              ...item,
              account: prevAccount.address,
              id: `${prevAccount.address}${item.name}`
            }, true))
        })
      })

      return prevAccount
    })

    this.setState({ accounts: updatedAccounDataArray, balances: updatedBalanceData, freeze: updatedFreezeData })
  }

  _setCurrency = currency => {
    this.setState({ currency }, () => AsyncStorage.setItem(USER_PREFERRED_CURRENCY, currency))
    if (!this.state.price[currency]) this._getPrice(currency)
  }

  _getPrice = async (currency = 'TRX') => {
    try {
      const { data: { data } } = await axios.get(`${Config.TRX_PRICE_API}/?convert=${currency}`)
      const { price } = this.state
      price[currency] = data.quotes[currency]
      if (currency !== 'USD') {
        price.USD = data.quotes.USD
      }
      this.setState({ price, circulatingSupply: data.circulating_supply })
    } catch (e) {
      logSentry(e, 'App - GetPrice')
    }
  }

  _loadAskPin = async () => {
    try {
      const askPin = await AsyncStorage.getItem(ALWAYS_ASK_PIN)
      const alwaysAskPin = askPin === null ? true : askPin === 'true'
      this.setState({ alwaysAskPin })
    } catch (error) {
      this.setState({ alwaysAskPin: true })
    }
  }

  _loadUseBiometry = async () => {
    try {
      const useBiometry = await AsyncStorage.getItem(USE_BIOMETRY)
      this.setState({ useBiometry: useBiometry === null ? false : useBiometry === 'true' })
    } catch (error) {
      this.setState({ useBiometry: false })
    }
  }

  _loadVerifiedTokenFlag = async () => {
    try {
      const tokenVibility = await AsyncStorage.getItem(TOKENS_VISIBLE)
      const verifiedTokensOnly = tokenVibility === null ? true : tokenVibility === 'true'
      this.setState({ verifiedTokensOnly })
    } catch (error) {
      this.setState({ verifiedTokensOnly: false })
    }
  }

  _loadFixedTokens = async () => {
    try {
      const fixedTokens = await getFixedTokens()
      this.setState({ fixedTokens })
    } catch (error) {
      this.setState({ fixedTokens: ['TRX', 'TWX'] })
      logSentry(error, 'App - Load Fixed Tokens')
    }
  }

  _loadCurrency = async () => {
    try {
      const preferedCurrency = await AsyncStorage.getItem(USER_PREFERRED_CURRENCY) || 'TRX'
      this._getPrice(preferedCurrency)
      this.setState({ currency: preferedCurrency })
    } catch (error) {
      this.setState({currency: 'TRX'})
      logSentry(error, 'App - Load Fixed Tokens')
    }
  }

  _setNodes = async () => {
    try {
      await NodesIp.initNodes()
    } catch (e) {
      logSentry(e, 'App - SetNodes')
    }
  }

  _updateSystemStatus = async () => {
    try {
      const {systemStatus, systemAddress} = await getSystemStatus()
      this.setState({systemStatus, systemAddress})
    } catch (error) {
      this.setState({
        systemStatus: { showStatus: false, statusMessage: '', statusColor: '', messageColor: '' }})
      logSentry(error, 'App - can\'t get system status')
    }
  }

  _setSecretMode = mode => this.setState({ secretMode: mode })

  _setPublicKey = publicKey => this.setState({ publicKey })

  _setAskPin = (alwaysAskPin) => this.setState({ alwaysAskPin })

  _setUseBiometry = (useBiometry) => this.setState({ useBiometry })

  _setVerifiedTokensOnly = (verifiedTokensOnly) => this.setState({ verifiedTokensOnly })

  _setPin = (pin, callback) => {
    this.setState({ pin }, () => {
      this._loadUserData()
      callback()
    })
  }

  _resetAccounts = () => this.setState({ accounts: [], publicKey: null })

  _hideAccount = address => {
    const newAccounts = this.state.accounts.filter(acc => acc.address !== address)
    this.setState({ accounts: newAccounts })
  }

  render () {
    const contextProps = {
      ...this.state,
      loadUserData: this._loadUserData,
      getPrice: this._getPrice,
      setPublicKey: this._setPublicKey,
      setPin: this._setPin,
      setCurrency: this._setCurrency,
      resetAccount: this._resetAccounts,
      hideAccount: this._hideAccount,
      setAskPin: this._setAskPin,
      setUseBiometry: this._setUseBiometry,
      setSecretMode: this._setSecretMode,
      setVerifiedTokensOnly: this._setVerifiedTokensOnly,
      updateSystemStatus: this._updateSystemStatus
    }

    return (
      <View style={{ backgroundColor: Colors.background, flex: 1 }} >
        <Context.Provider value={contextProps}>
          <StatusBar barStyle='light-content' />
          {this.state.systemStatus.showStatus && (
            <StatusMessage systemStatus={this.state.systemStatus} />
          )}
          <RootNavigator uriPrefix={prefix} />
        </Context.Provider>
      </View>
    )
  }
}

export default App
