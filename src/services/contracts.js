const { Op } = require('sequelize')
const { Contract, Profile } = require('../model')

async function getContractById(contractId, profile) {
  return Contract.findOne({
    where: {
      id: contractId,
    },
    include: {
      model: Profile,
      attributes: ['id'],
      where: {
        id: profile.id,
      },
      as: profile.type === 'client' ? 'Client' : 'Contractor',
    },
  })
}

async function getNonTerminatedContracts(profile) {
  return Contract.findAll({
    where: {
      // Op.ne can be used instead. In terms of performance it should be the same
      [Op.or]: [{ status: 'new' }, { status: 'in_progress' }],
    },
    include: {
      model: Profile,
      attributes: ['id'],
      where: {
        id: profile.id,
      },
      as: profile.type === 'client' ? 'Client' : 'Contractor',
    },
  })
}

module.exports = {
  getNonTerminatedContracts,
  getContractById,
}
