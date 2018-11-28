import React, { Component } from 'react'
import { FlatList } from 'react-native'

// Design
import * as Utils from '../../components/Utils'
import NavigationHeader from '../../components/Navigation/Header'
import ExchangeItem from './ExchangeItem'
import { Divider, EmptyList } from './elements'
import LoadingScene from '../../components/LoadingScene'

// Utils
import { withContext } from '../../store/context'
import tl from '../../utils/i18n'
import { logSentry } from '../../utils/sentryUtils'

// Services
import WalletClient from '../../services/client'

class ExchangeScene extends Component {
    static navigationOptions = { header: null }

    state = {
      exchangeList: [],
      exchangePrices: {},
      loading: true
    }

    componentDidMount () {
      this._navListener = this.props.navigation.addListener('didFocus', this._loadData)
      this._loadData()
    }

    componentWillUnmount () {
      this._navListener.remove()
    }

    _loadData = async () => {
      try {
        let exchangeList = await WalletClient.getExchangesList()
        this.setState({exchangeList, loading: false})
      } catch (error) {
        logSentry(error, 'Error exchange list')
        this.setState({exchangeList: [], loading: false})
      }
    }

    _renderItem = ({item}) => <ExchangeItem exchangeData={item} />

    _renderEmptyList = () => <EmptyList text={tl.t('exchange.notFound')} />

    _renderSeparator = () => <Divider />

    render () {
      const { loading, exchangeList } = this.state
      return (
        <Utils.SafeAreaView>
          <NavigationHeader title={tl.t('ex')} />
          {loading
            ? <LoadingScene />
            : <FlatList
              data={exchangeList}
              renderItem={this._renderItem}
              ListEmptyComponent={this._renderEmptyList}
              ItemSeparatorComponent={this._renderSeparator}
              keyExtractor={(item) => item.creatorAddress}
            />}
        </Utils.SafeAreaView>
      )
    }
}
export default withContext(ExchangeScene)
