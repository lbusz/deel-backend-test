const { Op } = require('sequelize')
const { Contract, Job, Profile, sequelize } = require('../model')

async function getBestProfession(start, end) {
  const jobs = await Job.findAll({
    attributes: [[sequelize.fn('sum', sequelize.col('price')), 'totalPaid']],
    order: [[sequelize.fn('sum', sequelize.col('price')), 'DESC']],
    group: ['Contract.Contractor.profession'],
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end],
      },
    },
    include: [
      {
        model: Contract,
        include: [
          {
            model: Profile,
            as: 'Contractor',
            where: { type: 'contractor' },
            attributes: ['profession'],
          },
        ],
      },
    ],
  })

  if (!jobs.length) {
    return []
  }

  const filteredResult = jobs[0].get({ plain: true })
  return {
    profession: filteredResult.Contract.Contractor.profession,
    totalPaid: filteredResult.totalPaid,
  }
}

async function getBestClients(start, end, limit = 2) {
  const results = await Job.findAll({
    attributes: [[sequelize.fn('sum', sequelize.col('price')), 'paid']],
    order: [[sequelize.fn('sum', sequelize.col('price')), 'DESC']],
    group: ['Contract.Client.id'],
    limit,
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end],
      },
    },
    include: [
      {
        model: Contract,
        attributes: ['id'],
        include: [
          {
            model: Profile,
            as: 'Client',
            where: { type: 'client' },
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      },
    ],
  })

  return results.map((jobs) => ({
    id: jobs.Contract.Client.id,
    fullName: `${jobs.Contract.Client.firstName} ${jobs.Contract.Client.lastName}`,
    paid: jobs.paid,
  }))
}

module.exports = {
  getBestProfession,
  getBestClients,
}
