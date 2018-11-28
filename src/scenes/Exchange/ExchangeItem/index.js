import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withNavigation } from 'react-navigation'

import { Colors } from '../../../components/DesignSystem'
import { ExchangeRow, TinyTriangle, ExchangeLogo } from '../elements'
import * as Utils from '../../../components/Utils'

class ExchangeItem extends Component {
    _renderPercentageIndicator = () => {
      const currentPercentage = Math.random() * 200 - 100
      const color = currentPercentage >= 0 ? Colors.weirdGreen : Colors.unconfirmed
      const triangle = currentPercentage >= 0
        ? { color: Colors.weirdGreen, direction: 'up' }
        : { color: Colors.unconfirmed, direction: 'down' }

      return <Utils.Row align='center'>
        <Utils.Text size='xsmall' color={color}>{currentPercentage.toFixed(2)}%</Utils.Text>
        <Utils.View width={16} />
        <TinyTriangle direction={triangle.direction} color={triangle.color} />
      </Utils.Row>
    }

    render () {
      const {
        firstTokenId,
        secondTokenId,
        // exchangeId,
        firstTokenImage,
        price } = this.props.exchangeData

      return <ExchangeRow onPress={() =>
        this.props.navigation.navigate('ExchangeTransaction', { exData: this.props.exchangeData })}>
        <ExchangeLogo source={firstTokenImage} />
        <Utils.View flex={1} paddingLeft='medium' justify='center'>
          <Utils.Text size='small'>{firstTokenId} / {secondTokenId}</Utils.Text>
          <Utils.View height={8} />
          <Utils.Row justify='space-between'>
            <Utils.Text size='xsmall' color={Colors.greyBlue}>{price.toFixed(8)}</Utils.Text>
            {/* {this._renderPercentageIndicator(exchangeId)} */}
          </Utils.Row>
        </Utils.View>
      </ExchangeRow>
    }
}

ExchangeItem.propTypes = {
  exchangeData: PropTypes.shape({
    firstTokenId: PropTypes.string,
    secondTokenId: PropTypes.string,
    firstTokenImage: PropTypes.string,
    price: PropTypes.number,
    exchangeId: PropTypes.number
  }).isRequired
}

export default withNavigation(ExchangeItem)
