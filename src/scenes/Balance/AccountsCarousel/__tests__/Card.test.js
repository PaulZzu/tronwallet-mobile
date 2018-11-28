import React from 'react'
import 'react-native'
import { shallow } from 'enzyme'
import Card from './../Card'
import { BtnTrash, CardInfo } from './../elements'
import TrxValue from './../../TrxValue'

jest.mock('../../../../utils/i18n')

describe('Balance <Card>', () => {
  const defaultProps = {
    price: 1,
    bandwidth: 50,
    currency: 'TRX',
    balance: 150,
    tronPower: 50,
    onCopy: jest.fn(),
    onDelete: jest.fn(),
    onCurrencyPress: jest.fn()
  }
  const setup = (propOverrides = {}) => {
    const props = { ...defaultProps, ...propOverrides }

    return shallow(
      <Card {...props} />
    )
  }

  test('renders without crashing', () => {
    const wrapper = setup()
    expect(wrapper).toBeDefined()
  })

  test('renders one button when showDeleteBtn is true', () => {
    const wrapper = setup()
    wrapper.setProps({ showDeleteBtn: true })
    const btn = wrapper.find(BtnTrash)
    expect(btn).toHaveLength(1)
  })

  test('hide trash button when showDeleteBtn is false', () => {
    const wrapper = setup()
    wrapper.setProps({ showDeleteBtn: false })
    expect(wrapper.find(BtnTrash)).toHaveLength(0)
  })

  test('Should Total balance is 200 when balance is 150, tronPower is 50 and price is 1', () => {
    const wrapper = setup()
    const trxValueProps = wrapper.find(TrxValue).first().props()
    expect(trxValueProps.trxBalance).toEqual(200)
  })

  test('Should available balance is 150 when balance is 150 and price is 1', () => {
    const wrapper = setup()
    const availableValue = wrapper.find(CardInfo).first().props()
    expect(availableValue.value).toEqual(150)
  })

  test('Should Frozen is 50 when tronPower is 50 and price is 1', () => {
    const wrapper = setup()
    const frozenValue = wrapper.find(CardInfo).last().props()
    expect(frozenValue.value).toEqual(50)
  })
})
