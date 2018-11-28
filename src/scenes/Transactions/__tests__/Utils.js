import React from 'react'
import { shallow } from 'enzyme'

import NavigationHeader from '../../../components/Navigation/Header'
import { TransactionsScene } from './../index'

export const setupTransactionScene = (propOverrides = {}) => {
  const defaultProps = {
    context: { publicKey: '1234567890' }
  }

  const props = { ...defaultProps, ...propOverrides }

  const wrapper = shallow(
    <TransactionsScene {...props} />
  )

  return {
    wrapper,
    syncButton: wrapper.find(NavigationHeader).first().props().leftButton
  }
}
