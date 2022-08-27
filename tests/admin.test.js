const request = require('supertest')
const app = require('../src/app')
const { Profile, Contract, Job } = require('../src/model')
const buildTestDB = require('./buildTestDB')

beforeEach(async () => {
  await buildTestDB()
})

describe('Admin Routes', () => {
  describe('/admin/best-profession', () => {
    it('should return the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-profession')
        .query({ start: '2020-08-14T23:11:26.737Z' })
        .query({ end: '2020-08-16T23:11:26.737Z' })

      expect(statusCode).toEqual(200)
      expect(body).toEqual(
        expect.objectContaining({
          profession: 'Programmer',
          totalPaid: 2683,
        })
      )
    })

    it('should return an empty array if there are no jobs for a particular time frame', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-profession')
        .query({ start: '2021-08-10T09:00:00.000Z' })
        .query({ end: '2021-08-16T23:59:59.000Z' })

      expect(statusCode).toEqual(200)
      expect(body).toHaveLength(0)
    })
  })

  describe('/admin/best-clients', () => {
    it('should returns the clients the paid the most for jobs in the query time period using default limit of 2.', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-clients')
        .query({ start: '2020-08-14T23:11:26.737Z' })
        .query({ end: '2020-08-15T19:11:26.737Z' })

      expect(statusCode).toEqual(200)
      expect(body).toEqual([
        {
          fullName: 'Ash Kethcum',
          id: 4,
          paid: 2020,
        },
        {
          fullName: 'Mr Robot',
          id: 2,
          paid: 242,
        },
      ])
    })

    it('should returns the clients the paid the most for jobs in the query time period using default passed limit variable.', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-clients')
        .query({ start: '2020-08-14T23:11:26.737Z' })
        .query({ end: '2020-08-15T19:11:26.737Z' })
        .query({ limit: 1 })

      expect(statusCode).toEqual(200)
      expect(body).toHaveLength(1)
      expect(body[0]).toEqual(
        expect.objectContaining({ fullName: 'Ash Kethcum', id: 4, paid: 2020 })
      )
    })

    it('should return [] if there are no jobs within given time range', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-clients')
        .query({ start: '2021-08-10T09:00:00.000Z' })
        .query({ end: '2021-08-16T23:59:59.000Z' })

      expect(statusCode).toEqual(200)
      expect(body).toHaveLength(0)
    })
  })
})
