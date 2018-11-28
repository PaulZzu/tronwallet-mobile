import React from 'react'
import { ActivityIndicator } from 'react-native'
import PropTypes from 'prop-types'

import ButtonGradient from '../../../components/ButtonGradient'
import * as Utils from '../../../components/Utils'
import { Colors } from '../../../components/DesignSystem'
import FadeIn from '../../../components/Animations/FadeIn'

const ExchangeButton = ({text, loading, result, onSubmit}) => {
  if (loading) return (<ActivityIndicator color={Colors.primaryText} />)
  else if (result) {
    return (<FadeIn name='result'>
      <Utils.Text
        size={result === 'success' ? 'medium' : 'small'}
        color={result === 'success' ? Colors.green : Colors.redError}
        align='center'
        font='regular'
      >
        {result === 'success' ? 'Success ✓' : 'Exchange Failed, please try again'}
      </Utils.Text>
    </FadeIn>)
  } else {
    return (<ButtonGradient
      font='bold'
      text={text}
      onPress={onSubmit}
      disabled={loading}
    />)
  }
}

ExchangeButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  result: PropTypes.oneOfType([ PropTypes.string, PropTypes.bool ]).isRequired,
  onSubmit: PropTypes.func.isRequired
}
ExchangeButton.defaultProps = {
  loading: false,
  result: null
}
export default ExchangeButton
