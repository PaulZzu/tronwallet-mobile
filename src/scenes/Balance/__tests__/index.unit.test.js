import React from 'react'
import { shallow } from 'enzyme'
import BalanceScene from './../index'

jest.mock('react-native-fabric')
jest.mock('react-navigation')
jest.mock('react-native-mixpanel')
jest.mock('../../../utils/i18n')
jest.mock('../../../utils/secretsUtils')
jest.mock('../../../services/contentful')
jest.mock('../../../utils/sentryUtils')
jest.mock('../../../utils/hocs/withContext')

const { logSentry } = require('../../../utils/sentryUtils')

describe('Balance Scene', () => {
  let balanceSceneWrapper = null

  beforeEach(() => {
    const props = {
      newAccountName: 'Jonathan',
      context: {
        secretMode: '',
        pin: '12345',
        oneSignalId: '',
        loadUserData: jest.fn()
      }
    }

    balanceSceneWrapper = shallow(<BalanceScene {...props} />)

    const instance = balanceSceneWrapper.instance()
    instance.carousel = {
      innerComponent: {
        _snapToNewAccount: () => { }
      }
    }
  })

  test('Should creatingNewAccount state is TRUE before new account is created', async () => {
    // Arrange
    const instance = balanceSceneWrapper.instance()
    let creatingNewAccount = null

    instance.setState = (object) => {
      if (creatingNewAccount === null) {
        creatingNewAccount = object.creatingNewAccount
      }
    }

    // Act
    await instance._addNewAccount()

    // Assert
    expect(creatingNewAccount).toBeTruthy()
  })

  test('Should creatingNewAccount state is FALSE when new account WAS created', async () => {
    // Arrange
    const instance = balanceSceneWrapper.instance()

    // Act
    await instance._addNewAccount()

    const { creatingNewAccount } = balanceSceneWrapper.state()

    // Assert
    expect(creatingNewAccount).toBeFalsy()
    expect(logSentry).not.toBeCalled()
  })

  test('Should creatingNewAccount state is FALSE when new account WASN\'T created', async () => {
    // Arrange
    const instance = balanceSceneWrapper.instance()
    instance.props.context.loadUserData = null

    // Act
    await instance._addNewAccount()
    const { creatingNewAccount } = balanceSceneWrapper.state()

    // Assert
    expect(creatingNewAccount).toBeFalsy()
    expect(logSentry).toBeCalled()
  })

  test('Should make sure that loadData is calling loadUserData', async () => {
    // Arrange
    const instance = balanceSceneWrapper.instance()

    // Act
    await instance._loadData()

    // Assert
    expect(instance.props.context.loadUserData).toBeCalled()
  })

  test('Should validate if logSentry is called when an exception occurs', async () => {
    // Arrange
    const instance = balanceSceneWrapper.instance()
    const { context } = instance.props

    context.loadUserData.mockImplementation(() => {
      throw new Error()
    })

    // Act
    await instance._loadData()

    // Assert
    expect(logSentry).toBeCalled()
  })

  test('Should validate if error content has been filled', async () => {
    // Arrange
    const instance = balanceSceneWrapper.instance()
    const { context } = instance.props

    context.loadUserData.mockImplementation(() => {
      throw new Error()
    })

    // Act
    await instance._loadData()

    // Assert
    const { error } = balanceSceneWrapper.state()
    expect(error).toBeTruthy()
  })
})
