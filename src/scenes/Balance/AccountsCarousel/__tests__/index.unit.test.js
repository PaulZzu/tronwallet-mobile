import React from 'react'
import { shallow } from 'enzyme'
import AccountsCarousel from './../index'

jest.mock('./../../../../utils/i18n')
jest.mock('./../../../../utils/secretsUtils')
jest.mock('./../../../../utils/sentryUtils')
jest.mock('./../../../../store/context')

const { Clipboard } = require('react-native')

describe('Account Carousel', () => {
  let accountCarouselWrapper = null
  let context = null

  beforeEach(() => {
    context = {
      price: {
        TRX: {
          price: 1
        },
        TWX: {
          price: 2
        }
      },
      setCurrency: jest.fn(),
      currency: 'TRX',
      accounts: [{
        bandwidth: 1,
        tronPower: 50,
        balance: 150
      }]
    }

    const props = { context }

    accountCarouselWrapper = shallow(<AccountsCarousel {...props} />)
  })

  test('Should balance values from element to match item when all values is filled', async () => {
    // Arrange
    const instance = accountCarouselWrapper.instance()
    const item = {
      bandwidth: 1,
      tronPower: 50,
      balance: 150
    }

    // Act
    const element = instance._renderItem({ item })

    // Assert
    const {
      balance,
      tronPower,
      bandwidth
    } = element.props

    expect({
      balance,
      tronPower,
      bandwidth
    }).toEqual(item)
  })

  test('Should balance values from element to match item when all values is zero', async () => {
    // Arrange
    const instance = accountCarouselWrapper.instance()
    const item = {
      bandwidth: 0,
      tronPower: 0,
      balance: 0
    }

    // Act
    const element = instance._renderItem({ item })

    // Assert
    const {
      balance,
      tronPower,
      bandwidth
    } = element.props

    expect({
      balance,
      tronPower,
      bandwidth
    }).toEqual(item)
  })

  test('Should balance values from element equals 0 when all values is undefined', async () => {
    // Arrange
    const instance = accountCarouselWrapper.instance()
    const item = {
      bandwidth: undefined,
      tronPower: undefined,
      balance: undefined
    }

    // Act
    const element = instance._renderItem({ item })

    // Assert
    const {
      balance,
      tronPower,
      bandwidth
    } = element.props

    expect({
      balance,
      tronPower,
      bandwidth
    }).toEqual({
      balance: 0,
      tronPower: 0,
      bandwidth: 0
    })
  })

  test('Should balance values from element equals 0 when all values is null', async () => {
    // Arrange
    const instance = accountCarouselWrapper.instance()
    const item = {
      bandwidth: null,
      tronPower: null,
      balance: null
    }

    // Act
    const element = instance._renderItem({ item })

    // Assert
    const {
      balance,
      tronPower,
      bandwidth
    } = element.props

    expect({
      balance,
      tronPower,
      bandwidth
    }).toEqual({
      balance: 0,
      tronPower: 0,
      bandwidth: 0
    })
  })

  test('Should element is null when item is null', async () => {
    // Arrange
    const instance = accountCarouselWrapper.instance()
    const item = null

    // Act
    const element = instance._renderItem({ item })

    // Assert
    expect(element).toBeNull()
  })

  test('Should price is 1 when currency is TRX', async () => {
    // Arrange
    const instance = accountCarouselWrapper.instance()

    // Act
    const price = instance.price

    // Assert
    expect(price).toBe(1)
  })

  test('Should price is 2 when currency is TWX', async () => {
    // Arrange
    const instance = accountCarouselWrapper.instance()

    // Act
    instance.props.context.currency = 'TWX'
    const price = instance.price

    // Assert
    expect(price).toBe(2)
  })

  test('Should returns TRUE when _onCopyAddress is called', async () => {
    const instance = accountCarouselWrapper.instance()

    // Act
    await instance._onCopyAddress()

    // Assert
    expect(Clipboard.setString).toBeCalled()
  })

  test('Should guarantee that setCurrency method IS triggered when handleCurrencyChange is called', async () => {
    const instance = accountCarouselWrapper.instance()
    const index = 1
    // Act
    await instance._handleCurrencyChange(index)

    // Assert
    expect(instance.props.context.setCurrency).toBeCalled()
  })

  test('Should guarantee that setCurrency method ISN\'T triggered when handleCurrencyChange is called', async () => {
    const instance = accountCarouselWrapper.instance()
    // Act
    await instance._handleCurrencyChange()

    // Assert
    expect(instance.props.context.setCurrency).not.toBeCalled()
  })

  test('Should guarantee that setCurrency INDEXING search is working when handleCurrencyChange is called', async () => {
    const instance = accountCarouselWrapper.instance()
    const index = 1
    // Act
    await instance._handleCurrencyChange(index)

    // Assert
    expect(instance.props.context.setCurrency).toBeCalledWith('TRX')
  })
})
