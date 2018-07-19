import React, { PureComponent } from 'react'
import { Motion, spring, presets } from 'react-motion'
import { Context } from '../../store/context'

import FadeIn from '../../components/Animations/FadeIn'
import * as Utils from '../../components/Utils'

class TrxInfo extends PureComponent {
  render () {
    return (
      <Context.Consumer>
        {({ price, freeze }) =>
          price.value &&
          freeze.value && (
            <FadeIn name='tronprice'>
              <Utils.Row justify='center'>
                <Utils.Content align='center'>
                  <Utils.Text size='xsmall' secondary>TRON POWER</Utils.Text>
                  <Motion
                    defaultStyle={{ power: 0 }}
                    style={{
                      power: spring(freeze.value.total, presets.gentle)
                    }}
                  >
                    {value => (
                      <Utils.Text padding={4}>{`${value.power.toFixed(0)}`}</Utils.Text>
                    )}
                  </Motion>
                </Utils.Content>
                <Utils.Content align='center'>
                  <Utils.Text size='xsmall' secondary>TRX PRICE</Utils.Text>
                  <Motion
                    defaultStyle={{ price: 0 }}
                    style={{ price: spring(price.value, presets.gentle) }}
                  >
                    {value => (
                      <Utils.Text padding={4}>
                        {`${value.price.toFixed(this.props.pricePrecision)} USD`}
                      </Utils.Text>
                    )}
                  </Motion>
                </Utils.Content>
                <Utils.Content align='center'>
                  <Utils.Text size='xsmall' secondary>BANDWIDTH</Utils.Text>
                  <Motion
                    defaultStyle={{ bandwidth: 0 }}
                    style={{
                      bandwidth: spring(
                        freeze.value.bandwidth.netRemaining,
                        presets.gentle
                      )
                    }}
                  >
                    {value => (
                      <Utils.Text padding={4}>
                        {`${value.bandwidth.toFixed(0)}`}
                      </Utils.Text>
                    )}
                  </Motion>
                </Utils.Content>
              </Utils.Row>
            </FadeIn>
          )
        }
      </Context.Consumer>
    )
  }
}

TrxInfo.defaultProps = {
  pricePrecision: 4
}

export default props => (
  <Context.Consumer>
    {context => <TrxInfo context={context} {...props} />}
  </Context.Consumer>
)