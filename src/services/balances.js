const { Contract, Job, Profile, sequelize } = require('../model')
const HttpError = require('../errors/httpError')

async function depositMoneyForClient(clientId, amount) {
  return sequelize.transaction(async (t) => {
    const client = await Profile.findByPk(clientId, { transaction: t })

    if (!client || client.type !== 'client') {
      throw new HttpError(404, 'We were unable to find the client')
    }

    const sumToPay = await Job.sum(
      'price',
      {
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
              ClientId: clientId,
            },
          },
        ],
      },
      { transaction: t }
    )

    const maxDepositAllowed = sumToPay * 0.25

    if (amount > maxDepositAllowed) {
      throw new HttpError(422, 'Deposit exceeds the maximum allowed')
    }

    client.balance = parseFloat((client.balance + amount).toFixed(2))

    await client.save({ transaction: t })

    return client
  })
}

module.exports = {
  depositMoneyForClient,
}
