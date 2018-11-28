import React from 'react'
import { Image } from 'react-native'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Colors, Spacing } from '../../components/DesignSystem'
import * as Utils from '../../components/Utils'

const DEFAULT_LOGO = require('../../assets/tron-logo-small.png')

export const ExchangeRow = styled.TouchableOpacity`
  flex-direction: row;
  padding-horizontal: ${Spacing.medium};
  padding-vertical: ${Spacing.medium};
`
export const Divider = styled.View`
  width: 95%;
  padding-right: ${Spacing.medium};
  background-color: ${Colors.greyBlue};
  height: 0.6;
`
export const ExchangePair = ({firstToken, secondToken, price}) =>
  <Utils.View paddingX='medium' marginY={18} flex={1} justify='center' align='center'>
    <Utils.View height={0.6} background={Colors.greyBlue} width='100%' />
    <Utils.Text marginY={8} size='smaller' color={Colors.greyBlue}>
      {`${firstToken}/${secondToken} ≈ ${price.toFixed(4)}`}
    </Utils.Text>
    <Utils.View height={0.6} background={Colors.greyBlue} width='100%' />
  </Utils.View>

ExchangePair.propTypes = {
  firstToken: PropTypes.string.isRequired,
  secondToken: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired
}

export const ExchangeVariation = ({text}) =>
  <Utils.Text padding={15} font='regular' size='tiny' align='center'>
    {text}
  </Utils.Text>

ExchangeVariation.propTypes = {
  text: PropTypes.string.isRequired
}

export const TinyTriangle = ({color, direction}) =>
  <Utils.View style={{
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: color,
    transform: [
      {rotate: direction === 'up' ? '0deg' : '180deg'}
    ]
  }} />

TinyTriangle.propTypes = {
  color: PropTypes.string.isRequired,
  direction: PropTypes.oneOf(['up', 'down']).isRequired
}

export const ExchangeLogo = ({source}) =>
  <Image
    source={source ? {uri: source} : DEFAULT_LOGO}
    style={{
      width: 50,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: Colors.greyBlue,
      alignSelf: 'center',
      height: 50
    }}
  />
ExchangeLogo.propTypes = {
  source: PropTypes.string
}

export const EmptyList = ({text}) => (
  <Utils.View flex={1} align='center' justify='center' padding={20}>
    <Image
      source={require('../../assets/empty.png')}
      resizeMode='contain'
      style={{ width: 200, height: 200 }} />
    <Utils.Text size='tiny'>{text}</Utils.Text>
  </Utils.View>
)
