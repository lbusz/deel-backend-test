const { Router } = require('express')

const { getProfile } = require('./middleware/getProfile')
const {
  getContractById,
  getNonTerminatedContracts,
} = require('./services/contracts')
const { getUnpaidJobs, payJob } = require('./services/jobs')
const { depositMoneyForClient } = require('./services/balances')
const { getBestClients, getBestProfession } = require('./services/admin')
const HttpError = require('./errors/httpError')
const {
  validate,
  depositSchema,
  bestProfessionSchema,
  bestClientsSchema,
  payJobSchema,
  contractByIdSchema,
} = require('./middleware/validations')

const router = new Router()

// This file can be splitted into multiple files, but
// I've decided to leave all routes in here in favor of time

function returnHandler(err, res) {
  return res.status(err.status || 500).send({
    message: err.message || 'Internal server error',
  })
}

// Contract routes
// -------------------------
router.get(
  '/contracts/:id',
  getProfile,
  validate(contractByIdSchema),
  async (req, res) => {
    const contractId = req.params.id
    const profile = req.profile

    try {
      const contract = await getContractById(contractId, profile)

      if (!contract) {
        throw new HttpError(404, 'Contract not found')
      }

      res.json(contract)
    } catch (err) {
      return returnHandler(err, res)
    }
  }
)

router.get('/contracts', getProfile, async (req, res) => {
  const profile = req.profile
  try {
    const contracts = await getNonTerminatedContracts(profile)
    res.json(contracts)
  } catch (err) {
    return returnHandler(err, res)
  }
})

// Job routes
// -------------------------
router.get('/jobs/unpaid', getProfile, async (req, res) => {
  const profile = req.profile
  try {
    const jobs = await getUnpaidJobs(profile)
    res.json(jobs)
  } catch (err) {
    return returnHandler(err, res)
  }
})

router.post(
  '/jobs/:id/pay',
  getProfile,
  validate(payJobSchema),
  async (req, res) => {
    const jobId = req.params.id
    const clientId = req.profile.id

    try {
      const updatedJob = await payJob(jobId, clientId)

      res.json(updatedJob)
    } catch (err) {
      return returnHandler(err, res)
    }
  }
)

// Balance routes
// -------------------------
router.post(
  '/balances/deposit/:userId',
  validate(depositSchema),
  async (req, res) => {
    const clientId = req.params.userId
    const { amount } = req.body
    try {
      const profile = await depositMoneyForClient(clientId, amount)

      res.json(profile)
    } catch (err) {
      return returnHandler(err, res)
    }
  }
)

// Admin routes
// -------------------------
router.get(
  '/admin/best-profession',
  validate(bestProfessionSchema),
  async (req, res) => {
    const { start, end } = req.query
    try {
      const bestProfession = await getBestProfession(start, end)

      res.json(bestProfession)
    } catch (err) {
      return returnHandler(err, res)
    }
  }
)

router.get(
  '/admin/best-clients',
  validate(bestClientsSchema),
  async (req, res) => {
    const { start, end, limit } = req.query
    try {
      const bestClients = await getBestClients(start, end, limit)

      res.json(bestClients)
    } catch (err) {
      return returnHandler(err, res)
    }
  }
)

module.exports = router
