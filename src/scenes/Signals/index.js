import React, { Component } from 'react'
import { FlatList, Platform, StyleSheet } from 'react-native'

import NavigationHeader from './../../components/Navigation/Header'
import * as Utils from './../../components/Utils'
import tl from '../../utils/i18n'
import ListItem from './../../components/List/ListItem'

import { getList } from './../../services/contentful/signal'

import { postFormat } from './../../utils/dateUtils'
import { withContext } from './../../store/context'

class Signals extends Component {
  static displayName = 'Signals Screen'

  state = {
    limit: 10,
    page: 1,
    list: []
  }

  componentDidMount = () => {
    // const { page, limit } = this.state
    // getList(page, limit).then(list => {
    //   this.setState({
    //     list
    //   })
    // })
  }

  _loadMore = (e) => {
    // this.setState({
    //   page: this.state.page + 1
    // }, () => {
    //   getList(this.state.page, this.state.limit).then(list => {
    //     const newList = [...this.state.list, ...list]
    //     this.setState({
    //       list: newList
    //     })
    //   })
    // })
  }

  _renderItem = ({ item }) => {
    return (
      <ListItem
        title={item.title}
        subtitle={item.message}
        rightTitle={postFormat(item.updatedAt)}
        avatar={{ uri: item.tokenLogo }}
      />
    )
  }

  render () {
    console.log(this.props)
    const { list } = this.state
    return (
      <Utils.SafeAreaView>
        <NavigationHeader title={tl.t('news.title')} />
        <FlatList
          contentContainerStyle={list.length === 0 ? styles.emptyList : {}}
          data={list}
          // ListEmptyComponent={<Empty loading={refreshing} />}
          keyExtractor={item => item.id}
          renderItem={this._renderItem}
          initialNumToRender={10}
          onEndReachedThreshold={0.75}
          onEndReached={this._loadMore}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </Utils.SafeAreaView>
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

const mapContext = ({ signals }) => ({ signals })
const mapActions = () => ({ getList })

export default withContext(Signals, mapContext, mapActions)
