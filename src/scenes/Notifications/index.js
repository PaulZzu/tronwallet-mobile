import React, { Component } from 'react'
import { FlatList, Platform, StyleSheet } from 'react-native'

import NavigationHeader from './../../components/Navigation/Header'
import * as Utils from './../../components/Utils'
import tl from '../../utils/i18n'
import ListItem from './../../components/List/ListItem'

class Notifications extends Component {
  state = {
    list: [
      {
        id: '1',
        name: 'New transfer received',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque laoreet suscipit odio non finibus. Curabitur efficitur euismod porta. '
      },
      {
        id: '2',
        name: 'New transfer received',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque laoreet suscipit odio non finibus. Curabitur efficitur euismod porta. '
      }
    ]
  }

  _renderItem = ({ item }) => {
    return (
      <ListItem
        title={item.name}
        subtitle={item.subtitle}
        rightTitle='16 hours ago'
      />
    )
  }

  render () {
    const { list } = this.state
    return (
      <Utils.SafeAreaView>
        <NavigationHeader title={tl.t('notifications.title')} />
        <FlatList
          contentContainerStyle={list.length === 0 ? styles.emptyList : {}}
          data={list}
          // ListEmptyComponent={<Empty loading={refreshing} />}
          keyExtractor={item => item.id}
          renderItem={this._renderItem}
          initialNumToRender={10}
          onEndReachedThreshold={0.75}
          // onEndReached={this._loadRemainingTransactions}
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

export default Notifications
