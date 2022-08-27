const { Op } = require('sequelize')
const { Contract, Job, Profile, sequelize } = require('../model')
const HttpError = require('../errors/httpError')

async function getUnpaidJobs(profile) {
  const query = {
    where: {
      paid: null,
    },
    include: [
      {
        model: Contract,
        required: true,
        attributes: [],
        where: {
          status: 'in_progress',
        },
      },
    ],
  }
  // Either ClientId or ContractorId is added dynamically based on client type
  // This will improve performance over using an OR db clause
  if (profile.type === 'client') {
    query.include[0].where.ClientId = profile.id
  } else {
    query.include[0].where.ContractorId = profile.id
  }

  return Job.findAll(query)
}

async function payJob(jobId, clientId) {
  // This is a Managed Sequelize transaction,
  // https://sequelize.org/docs/v6/other-topics/transactions/#managed-transactions
  // It handles committing or rolling back automatically
  return sequelize.transaction(async (t) => {
    const job = await Job.findOne(
      {
        where: {
          id: jobId,
        },
        include: [
          {
            model: Contract,
            required: true,
            attributes: ['ContractorId'],
            where: {
              ClientId: clientId,
            },
          },
        ],
      },
      { transaction: t }
    )

    if (!job) {
      throw new HttpError(404, 'Job was not found')
    }

    if (job.paid) {
      throw new HttpError(422, 'This job was already paid')
    }

    const [client, contractor] = await Promise.all([
      Profile.findByPk(clientId, { transaction: t }),
      Profile.findByPk(job.Contract.ContractorId, {
        transaction: t,
      }),
    ])

    if (client.balance < job.price) {
      throw new HttpError(
        422,
        "You don't have enough funds to pay for this job"
      )
    }

    // move the money and mark as paid
    client.balance = client.balance - job.price
    contractor.balance = contractor.balance + job.price
    job.paid = true
    job.paymentDate = new Date().toISOString()

    await Promise.all([
      client.save({ transaction: t }),
      contractor.save({ transaction: t }),
      job.save({ transaction: t }),
    ])

    return job
  })
}

module.exports = {
  getUnpaidJobs,
  payJob,
}
