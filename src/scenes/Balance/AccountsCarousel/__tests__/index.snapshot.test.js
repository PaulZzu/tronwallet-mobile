import React from 'react'
import 'react-native'
import { shallow } from 'enzyme'
import AccountsCarousel from './../index'

jest.mock('./../../../../utils/i18n')
jest.mock('./../../../../utils/secretsUtils')
jest.mock('./../../../../utils/sentryUtils')
jest.mock('./../../../../store/context')

describe('Account Carousel Snapshot', () => {
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

  test('Should match snapshot', () => {
    expect(accountCarouselWrapper).toMatchSnapshot()
  })
})
