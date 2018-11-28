import React, { Component } from 'react'
import { ScrollView, Alert } from 'react-native'
import RNTron from 'react-native-tron'

// Design
import Input from '../../../components/Input'
import * as Utils from '../../../components/Utils'
import { Colors } from '../../../components/DesignSystem'
import { ExchangePair, ExchangeVariation } from '../elements'
import ExchangeBalancePair from '../ExchangeBalancePair'

// Utils
import tl from '../../../utils/i18n'
import { withContext } from '../../../store/context'
import { expectedBuy, estimatedBuyCost } from '../../../utils/exchangeUtils'
import { formatFloat } from '../../../utils/numberUtils'
import { logSentry } from '../../../utils/sentryUtils'

// Service
import WalletClient from '../../../services/client'
import ExchangeButton from '../ExchangeButton'

class BuyScene extends Component {
  static navigationOptions = { header: null }

  state = {
    buyAmount: '',
    loading: false,
    refreshingPrice: false,
    result: false
  }

  componentWillUnmount () {
    clearTimeout(this.buyTimeout)
  }

  _submit = () => {
    const { buyAmount } = this.state
    const { balances, publicKey } = this.props.context
    const { firstTokenBalance, secondTokenBalance, firstTokenId, secondTokenId } = this.props.exchangeData

    if (buyAmount <= 0 || !buyAmount) {
      this.buyAmount.focus()
      return
    }

    const estimatedCost = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount, secondTokenId === 'TRX')

    if (secondTokenBalance < estimatedCost) {
      Alert.alert(tl.t('warning'),
        `Not enough trading balance. Currently at ${secondTokenBalance} ${secondTokenId}`)
      this.buyAmount.focus()
      return
    }

    const { balance: userSecondTokenBalance } =
      balances[publicKey].find(bl => bl.name === secondTokenId) || { balance: 0 }

    if (userSecondTokenBalance <= 0 || userSecondTokenBalance < estimatedCost) {
      Alert.alert(tl.t('warning'), `You don't have enough ${secondTokenId} to buy ${firstTokenId}`)
      return
    }

    this.props.navigation.navigate('Pin', {
      shouldGoBack: true,
      testInput: pin => pin === this.props.context.pin,
      onSuccess: this._exchangeToken
    })
  }

  _exchangeToken = async () => {
    const { buyAmount } = this.state
    const { publicKey, accounts, loadUserData } = this.props.context
    const { exchangeId, firstTokenBalance, secondTokenBalance, secondTokenId, firstTokenId } = this.props.exchangeData

    const quant = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount)
    const expected = expectedBuy(buyAmount, firstTokenId === 'TRX')

    this.setState({loading: true})
    try {
      const exParams = {
        address: publicKey,
        tokenId: secondTokenId,
        exchangeId,
        quant,
        expected
      }

      const transactionUnsigned = await WalletClient.getExchangeTransaction(exParams)
      const userKey = accounts.find(acc => acc.address === publicKey).privateKey
      const signedTransaction = await RNTron.signTransaction(userKey, transactionUnsigned)

      const { code } = await WalletClient.broadcastTransaction(signedTransaction)

      if (code === 'SUCCESS') {
        this.setState({result: 'success', loading: false})
        loadUserData()
      } else {
        this.setState({result: 'fail'})
      }
    } catch (error) {
      this.setState({result: 'fail', loading: false})
      logSentry(error, 'Buying Exchange')
    } finally {
      this.buyTimeout = setTimeout(() => this.setState({buyAmount: '', result: false}), 3200)
    }
  }

  _renderRightContent = token =>
    <Utils.Text size='small' color={Colors.greyBlue}>
      {token}
    </Utils.Text>

  render () {
    const {
      buyAmount,
      loading,
      result
    } = this.state
    const {
      firstTokenId,
      firstTokenBalance,
      firstTokenImage,
      secondTokenId,
      secondTokenBalance,
      secondTokenImage,
      price } = this.props.exchangeData
    const cost = estimatedBuyCost(firstTokenBalance, secondTokenBalance, buyAmount || 0, secondTokenId === 'TRX')
    const minBuy = Math.floor(cost / price)
    const isTokenToken = secondTokenId !== 'TRX' && firstTokenId !== 'TRX'
    return (
      <Utils.SafeAreaView>
        <ScrollView>
          <Utils.View height={24} />
          <ExchangeBalancePair
            firstToken={firstTokenId}
            firstTokenImage={firstTokenImage}
            secondToken={secondTokenId}
            secondTokenImage={secondTokenImage}
          />
          <ExchangePair
            firstToken={firstTokenId}
            secondToken={secondTokenId}
            price={price}
          />
          <Utils.View flex={1} justify='center' paddingX='medium' paddingY='small'>
            <Input
              label={tl.t('buy').toUpperCase()}
              innerRef={input => { this.buyAmount = input }}
              onChangeText={buyAmount => this.setState({buyAmount})}
              rightContent={() => this._renderRightContent(firstTokenId)}
              placeholder='0'
              keyboardType='numeric'
              type='float'
              numbersOnly
              value={buyAmount}
            />
            {isTokenToken &&
            <Utils.Text size='tiny' font='regular' align='right'>
              {tl.t('exchange.minToBuy', {min: minBuy, tokenId: firstTokenId})}
            </Utils.Text>}
            <Input
              label='ESTIMATED COST'
              rightContent={() => this._renderRightContent(secondTokenId)}
              placeholder={formatFloat(cost)}
              editable={false}
            />
            <ExchangeVariation text={tl.t('exchange.variation.buy')} />
            <ExchangeButton
              text={tl.t('buy').toUpperCase()}
              loading={loading}
              result={result}
              onSubmit={this._submit}
            />
          </Utils.View>
        </ScrollView>
      </Utils.SafeAreaView>
    )
  }
}

export default withContext(BuyScene)
