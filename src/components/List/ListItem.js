import React from 'react'
import { ListItem, Avatar } from 'react-native-elements'
import { Colors } from './../DesignSystem'

export default ({ title, subtitle, rightTitle, avatar }) => (
  <ListItem
    title={title}
    subtitle={subtitle}
    hideChevron
    subtitleNumberOfLines={3}
    rightTitle={rightTitle}
    avatar={
      avatar && (
        <Avatar
          rounded
          source={avatar}
          medium
        />
      )
    }
    containerStyle={{
      paddingTop: 29,
      borderBottomColor: Colors.dusk,
      minHeight: 142,
      borderBottomWidth: 0.8,
      marginRight: 21
    }}
    titleStyle={{
      color: Colors.primaryText,
      fontFamily: 'Rubik-Medium',
      fontSize: 13,
      marginBottom: 14
    }}
    rightTitleStyle={{
      fontFamily: 'Rubik-Regular',
      fontSize: 10,
      color: Colors.greyBlue
    }}
    rightTitleContainerStyle={{
      position: 'absolute',
      top: 0,
      right: -15
    }}
    subtitleStyle={{
      fontFamily: 'Rubik-Regular',
      fontSize: 12,
      color: Colors.greyBlue,
      lineHeight: 20
    }}
  />
)
