import Axios from '../axios'
import Api from '../api'
jest.mock('../axios')

afterEach(() => {
  jest.clearAllMocks();
})

describe('Api', () => {
  describe('ValidateToken', () => {
    it('returns `true` if token is valid', async () => {
      Axios.get.mockImplementationOnce(() => ({ status: 200}))
      const api = new Api();
      const response = await api.validateToken()
      expect(response).toBeTruthy();
    })

    it('returns `false` if token is not valid', async () => {
      Axios.get.mockImplementationOnce(() => ({ status: 400}))
      const api = new Api();
      const response = await api.validateToken()
      expect(response).toBeFalsy();
    })

    it('is able to trow an error', async () => {
      Axios.get.mockImplementation(() => { throw { response: 'Something went wrong' } })
      const api = new Api();
      const response = await api.validateToken()
      expect(response).toEqual('Something went wrong');
    })
  })
})
