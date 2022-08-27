const express = require('express')
const bodyParser = require('body-parser')
const { Op, dialect, literal, queryGenerator } = require('sequelize')
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const router = require('./router')

const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
app.use(router)

app.use((error, req, res, next) => {
  res.status(500).json({
    error: 'Internal server error',
  })
})

module.exports = app
