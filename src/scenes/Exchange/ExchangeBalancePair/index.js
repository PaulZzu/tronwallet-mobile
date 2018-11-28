import React, { Component } from 'react'
import { Image } from 'react-native'
import { Motion, spring } from 'react-motion'
import PropTypes from 'prop-types'

import { Colors, Spacing } from '../../../components/DesignSystem'
import * as Utils from '../../../components/Utils'
import { withContext } from '../../../store/context'
import { ExchangeLogo } from '../elements'

import { formatNumber } from '../../../utils/numberUtils'

const ARROW_GRADIENT = require('../../../assets/arrow-right-gradient.png')

class ExchangeBalancePair extends Component {
  _findTokenBalance = (tokenName) => {
    const { balances, publicKey } = this.props.context
    const { balance: tokenBalance } = balances[publicKey].find(bl => bl.name === tokenName) || { balance: 0 }
    return tokenBalance
  }
  render () {
    const { firstToken, secondToken, firstTokenImage, secondTokenImage } = this.props
    const firstTokenBalance = this._findTokenBalance(firstToken)
    const secondTokenBalance = this._findTokenBalance(secondToken)

    return (<Utils.View marginX={Spacing.large} paddingY='small'>
      <Utils.Row align='center'>
        <Utils.View flex={0.33} align='center' justify='center'>
          <ExchangeLogo source={firstTokenImage} />
          <Utils.Text marginTop='small' size='small'>{firstToken}</Utils.Text>
          <Motion
            defaultStyle={{ firstBalance: 0 }}
            style={{firstBalance: spring(firstTokenBalance)}}>
            {value =>
              <Utils.Text size='xsmall' color={Colors.greyBlue}>
                {formatNumber(value.firstBalance)}
              </Utils.Text>
            }
          </Motion>
        </Utils.View>
        <Utils.View flex={0.33} align='center' justify='center'>
          <Image
            source={ARROW_GRADIENT}
            style={{height: 12, width: 20}}
          />
        </Utils.View>
        <Utils.View flex={0.33} justify='center' align='center'>
          <ExchangeLogo source={secondTokenImage} />
          <Utils.Text marginTop='small' size='small'>{secondToken}</Utils.Text>
          <Motion
            defaultStyle={{ secondBalance: 0 }}
            style={{secondBalance: spring(secondTokenBalance)}}>
            {value =>
              <Utils.Text size='xsmall' color={Colors.greyBlue}>
                {formatNumber(value.secondBalance)}
              </Utils.Text>
            }
          </Motion>
        </Utils.View>
      </Utils.Row>
    </Utils.View>)
  }
}
ExchangeBalancePair.propTypes = {
  firstToken: PropTypes.string.isRequired,
  secondToken: PropTypes.string.isRequired,
  firstTokenImage: PropTypes.string,
  secondTokenImage: PropTypes.string
}
ExchangeBalancePair.defaultProps = {
  firstToken: '',
  secondToken: '',
  firstTokenImage: '',
  secondTokenImage: ''
}
export default withContext(ExchangeBalancePair)
