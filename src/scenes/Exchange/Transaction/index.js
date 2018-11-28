import React, { Component } from 'react'
import { Dimensions } from 'react-native'
import { TabViewAnimated, TabBar } from 'react-native-tab-view'

// Design
import { Colors } from '../../../components/DesignSystem'
import SellScene from '../Sell'
import BuyScene from '../Buy'
import NavigationHeader from '../../../components/Navigation/Header'
import { SafeAreaView } from '../../../components/Utils'

// Utils
import tl from '../../../utils/i18n'

// Service
import WalletClient from '../../../services/client'

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width
}

const SCREENSIZE = Dimensions.get('window')
const TAB_WIDTH = SCREENSIZE.width / 2
const INDICATOR_WIDTH = 13

export default class TransferScene extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    index: 0,
    routes: [
      { key: 'buy', title: tl.t('buy') },
      { key: 'sell', title: tl.t('sell') }
    ],
    exchangeData: this.props.navigation.getParam('exData',
      { exchangeId: -1,
        creatorAddress: '',
        createTime: 0,
        firstTokenId: '',
        firstTokenBalance: 0,
        secondTokenId: '',
        secondTokenBalance: 0,
        available: false,
        price: 0
      }),
    refreshingPrice: false
  }

  componentDidMount () {
    this.refreshInterval = setInterval(this._refreshPrice, 10000)
  }

  componentWillUnmount () {
    clearInterval(this.refreshInterval)
  }

  _refreshPrice = async () => {
    const { refreshingPrice, exchangeData } = this.state

    if (refreshingPrice) return

    this.setState({refreshingPrice: true})
    try {
      const updatedExchangeData = await WalletClient.getExchangeById(exchangeData.exchangeId)
      this.setState({exchangeData: {...exchangeData, ...updatedExchangeData}})
    } catch (error) {
      console.warn('Failed to refresh', error.message)
    } finally {
      this.setState({refreshingPrice: false})
    }
  }
  _handleIndexChange = index => this.setState({ index })

  _renderHeader = props => (
    <TabBar
      {...props}
      indicatorStyle={{
        width: INDICATOR_WIDTH,
        height: 1,
        marginLeft: TAB_WIDTH / 2 - INDICATOR_WIDTH / 2
      }}
      tabStyle={{
        padding: 8
      }}
      labelStyle={{
        fontFamily: 'Rubik-Medium',
        fontSize: 12,
        letterSpacing: 0.65,
        lineHeight: 12
      }}
      style={{
        backgroundColor: Colors.background,
        elevation: 0,
        shadowOpacity: 0
      }}
    />
  )

  _renderScene = ({ route }) => {
    switch (route.key) {
      case 'sell':
        return <SellScene {...this.props} exchangeData={this.state.exchangeData} />
      case 'buy':
        return <BuyScene {...this.props} exchangeData={this.state.exchangeData} />
      default:
        return null
    }
  }
  render () {
    return (
      <SafeAreaView>
        <React.Fragment>
          <NavigationHeader
            title='EXCHANGE'
            onBack={() => this.props.navigation.goBack()}
          />
          <TabViewAnimated
            navigationState={this.state}
            renderScene={this._renderScene}
            renderHeader={this._renderHeader}
            onIndexChange={this._handleIndexChange}
            initialLayout={initialLayout}
          />
        </React.Fragment>
      </SafeAreaView>
    )
  }
}
