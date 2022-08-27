const yup = require('yup')

const depositSchema = yup.object({
  body: yup.object({
    amount: yup.number().required(),
  }),
  params: yup.object({
    userId: yup.number().required(),
  }),
})

const bestProfessionSchema = yup.object({
  query: yup.object({
    start: yup.date().required(),
    end: yup.date().required(),
  }),
})

const payJobSchema = yup.object({
  params: yup.object({
    id: yup.number().required(),
  }),
})

const bestClientsSchema = yup.object({
  query: yup.object({
    start: yup.date().required(),
    end: yup.date().required(),
    limit: yup.number().optional(),
  }),
})

const contractByIdSchema = yup.object({
  params: yup.object({
    id: yup.number().required(),
  }),
})

function validate(schema) {
  return async function (req, res, next) {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      return next()
    } catch (err) {
      return res.status(422).json({ type: err.name, message: err.message })
    }
  }
}

module.exports = {
  validate,
  depositSchema,
  bestProfessionSchema,
  bestClientsSchema,
  payJobSchema,
  contractByIdSchema,
}
