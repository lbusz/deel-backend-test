const request = require('supertest')
const app = require('../src/app')
const { Profile, Contract, Job } = require('../src/model')
const buildTestDB = require('./buildTestDB')

beforeEach(async () => {
  await buildTestDB()
})
describe('Balance Routes', () => {
  describe('/balances/deposit/:userId', () => {
    it("should icrement then client's balance by the deposited amount", async () => {
      const { statusCode, body } = await request(app)
        .post('/balances/deposit/1')
        .send({ amount: 10 })

      expect(statusCode).toEqual(200)
      expect(body).toEqual(
        expect.objectContaining({
          id: 1,
          firstName: 'Harry',
          lastName: 'Potter',
          profession: 'Wizard',
          balance: 1160,
          type: 'client',
        })
      )
    })

    it('should return 422 if the deposit is greater than 25 percent of unpaid jobs', async () => {
      const { statusCode, body } = await request(app)
        .post('/balances/deposit/1')
        .send({ amount: 1000 })

      expect(statusCode).toEqual(422)
      expect(body.message).toEqual('Deposit exceeds the maximum allowed')
    })

    it('should return 404 if the user is not of the type client', async () => {
      const { statusCode, body } = await request(app)
        .post('/balances/deposit/5')
        .send({ amount: 100 })

      expect(statusCode).toEqual(404)
      expect(body.message).toEqual('We were unable to find the client')
    })

    it('should return 404 if client is not found', async () => {
      const { statusCode, body } = await request(app)
        .post('/balances/deposit/12')
        .send({ amount: 100 })

      expect(statusCode).toEqual(404)
      expect(body.message).toEqual('We were unable to find the client')
    })
  })
})
