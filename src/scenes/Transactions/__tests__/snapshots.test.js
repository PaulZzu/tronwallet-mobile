import transactionListMock from '../../../services/__mocks__/transactionList'
import { setupTransactionScene } from './Utils'

jest.mock('../../../utils/i18n')
jest.mock('../../../services/client')

describe('Transaction snapshots test', () => {
  test('Should Transactions/index match snapshot', () => {
    const { wrapper } = setupTransactionScene()
    wrapper.setState({ transactions: transactionListMock })
    expect(wrapper).toMatchSnapshot()
  })
})
