import React, { Component } from 'react'
import { FlatList, AsyncStorage, Platform, Image, StyleSheet } from 'react-native'
import { Answers } from 'react-native-fabric'
import forIn from 'lodash/forIn'
import MixPanel from 'react-native-mixpanel'

import tl from '../../utils/i18n'
import Transaction from './Transaction'
import { InnerRow, FilterText, FilterWrapper } from './elements'
import NavigationHeader from '../../components/Navigation/Header'
import SyncButton from '../../components/SyncButton'
import { USER_FILTERED_TOKENS } from '../../utils/constants'

import getAssetsStore from '../../store/assets'
import getTransactionStore from '../../store/transactions'
import getContactsStore from '../../store/contacts'
import { withContext } from '../../store/context'
import { updateTransactions, getTokenPriceFromStore } from '../../utils/transactionUtils'
import { logSentry } from '../../utils/sentryUtils'
import { Colors } from '../../components/DesignSystem'
import Empty from './Empty'
import FontelloButton from '../../components/FontelloButton'
import { SafeAreaView } from './../../components/Utils'

export class TransactionsScene extends Component {
  static navigationOptions = { header: null }
  static displayName = 'TransactionsScene'

  state = {
    refreshing: true,
    transactions: [],
    currentAlias: '',
    contact: null,
    contacts: []
  }

  componentDidMount () {
    Answers.logContentView('Tab', 'Transactions')
    this._didFocusSubscription = this.props.navigation.addListener('didFocus', this._didFocus)
    this._setData()
  }

  componentWillUnmount () {
    this._didFocusSubscription.remove()
  }

  _setData = () => {
    return Promise.all([getTransactionStore(), getContactsStore(), getAssetsStore()])
      .then(retults => {
        this.setState({
          transactionStoreRef: retults[0],
          contactsStoreRef: retults[1],
          assetStore: retults[2]
        }, () => this._loadData())
        MixPanel.trackWithProperties('Transactions', { type: 'My transactions' })
      })
  }

  _didFocus = () => {
    if (this.state.transactionStoreRef && !this.state.refreshing) {
      this._loadData()
    }
  }

  _firstTransactions = () => this._allTransactions().slice(0, 10)

  _allTransactions = () =>
    this.state.transactionStoreRef
      .objects('Transaction')
      .filtered('ownerAddress = $0', this.props.context.publicKey)
      .sorted([['timestamp', true]])

  _getAlias = address => {
    if (!address) return
    const { systemAddress } = this.props.context

    let systemFixedName = null
    forIn(systemAddress, (sys) => {
      if (sys.address === address) {
        systemFixedName = sys.name
        return false
      }
    })

    if (systemFixedName) {
      return systemFixedName
    } else {
      const contact = this.state.contacts.find(c => c.address === address)
      return contact ? contact.alias : address
    }
  }

  _loadData = async isRefreshing => {
    const contacts = this.state.contactsStoreRef.objects('Contact').map(item => Object.assign({}, item))
    const foundAlias = contacts.find(c => c.address === this.props.context.publicKey)
    const currentAlias = foundAlias ? foundAlias.alias : this.props.context.publicKey
    const contact = this.props.navigation.getParam('contact', null)

    try {
      await updateTransactions(this.props.context.publicKey)
    } catch (error) {
      logSentry(error, 'On Refresh - Transactions')
    }

    const transactionRef = this._getTransactionsByContactOrRefreshing(contact, isRefreshing)

    this.setState({ currentAlias, contacts, contact, refreshing: true },
      () => this._updateData(transactionRef, isRefreshing, contact))
  }

  _getTransactionsByContactOrRefreshing = (contact, isRefreshing) => {
    if (contact) {
      return this._setFilteredContact(contact)
    }

    if (isRefreshing) {
      return this._allTransactions()
    }

    return this._firstTransactions()
  }

  _setFilteredContact = contact =>
    this.state.transactionStoreRef
      .objects('Transaction')
      .filtered(
        'contractData.transferFromAddress = $0 OR contractData.transferToAddress = $0',
        contact.address
      )
      .sorted([['timestamp', true]])

  _removeFilteredContact = () => {
    this.props.navigation.setParams({ contact: null })
    this.setState({ contact: null }, () => this._loadData())
  }

  _updateData = async (transactionsRef, isRefreshing = false, contact = null) => {
    try {
      const allTransactions = transactionsRef.map(item => Object.assign({}, item))
      const transactionsWithParticipate = this._updateParticipateTransactions(
        allTransactions,
        this.state.assetStore
      )
      let transactions = this._getTransactionByAddress(transactionsWithParticipate)

      if (!!contact && isRefreshing) {
        transactions = this._mergeNewTransactions(transactions)
      }

      const filteredTransactions = await this._getFilteredTransactions(transactions)
      this.setState({ transactions: filteredTransactions, refreshing: false })
    } catch (err) {
      this.setState({ refreshing: false })
      logSentry(err, 'Transactions - load data')
    }
  }

  _getFilteredTransactions = async transactions => {
    const userTokens = await AsyncStorage.getItem(USER_FILTERED_TOKENS)
    return transactions.filter(({ type, contractData }) =>
      contractData.tokenName === null ||
        JSON.parse(userTokens).findIndex(name => name === contractData.tokenName) === -1
    )
  }

  _updateParticipateTransactions = (transactions, assetStore) =>
    transactions.map(transaction => {
      if (transaction.type === 'Participate') {
        const tokenPrice = getTokenPriceFromStore(transaction.contractData.tokenName, assetStore)
        return { ...transaction, tokenPrice }
      } else {
        return transaction
      }
    })

  _getTransactionByAddress = transactions =>
    transactions
      .filter(item => item.ownerAddress === this.props.context.publicKey)
      .map(item =>
        Object.assign(
          {},
          {
            ...item,
            contractData: {
              ...item.contractData,
              transferFromAddress: this._getAlias(item.contractData.transferFromAddress),
              transferToAddress: this._getAlias(item.contractData.transferToAddress)
            }
          }
        )
      )

  _mergeNewTransactions = newTransactions => {
    const { transactions: currentTransactions } = this.state
    const oldTransactions = currentTransactions.filter(t => !newTransactions.find(n => n.id === t.id))
    return [...newTransactions, ...oldTransactions]
  }

  _loadRemainingTransactions = async () => {
    if (this.state.transactionStoreRef && !this.state.refreshing) {
      this._loadData(true)
    }
  }

  _navigateToDetails = item => {
    this.props.navigation.navigate('TransactionDetails', { item })
  }

  _renderFilter = () => {
    const { contact } = this.state
    if (contact && contact.address) {
      return (
        <FilterWrapper>
          <InnerRow>
            <Image
              source={require('../../assets/gradient-book.png')}
              style={{ width: 16, height: 16 }}
              color={Colors.buttonGradient[1]}
            />
            <FilterText marginX={12} dark>
              {tl.t('filter')}:
            </FilterText>
            <FilterText numberOfLines={1}>{contact.alias}</FilterText>
          </InnerRow>
          <InnerRow>
            <FontelloButton
              onPress={this._removeFilteredContact}
              name='close'
              color='white'
              size={16}
            />
          </InnerRow>
        </FilterWrapper>
      )
    } else {
      return null
    }
  }

  _renderItem = ({ item }) => {
    const { currentAlias } = this.state
    const { publicKey } = this.props.context
    return (
      <Transaction
        item={item}
        currentAlias={currentAlias}
        onPress={() => this._navigateToDetails(item)}
        publicKey={publicKey}
      />
    )
  }

  render () {
    const { refreshing } = this.state
    const { transactions } = this.state
    return (
      <SafeAreaView>
        <NavigationHeader
          title={tl.t('transactions.title')}
          leftButton={
            <SyncButton
              loading={refreshing}
              onPress={() => this._loadData(true)}
            />
          }
        />
        <FlatList
          contentContainerStyle={transactions.length === 0 ? styles.emptyList : {}}
          data={transactions}
          ListEmptyComponent={<Empty loading={refreshing} />}
          ListHeaderComponent={this._renderFilter}
          keyExtractor={item => item.id}
          renderItem={this._renderItem}
          initialNumToRender={10}
          onEndReachedThreshold={0.75}
          onEndReached={this._loadRemainingTransactions}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  emptyList: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  }
})

export default withContext(TransactionsScene)
