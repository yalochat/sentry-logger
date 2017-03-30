'use strict'

const Joi = require('joi')
const Raven = require('raven')

const messages = ['debug', 'info', 'warning', 'error', 'fatal']
const exceptions = ['debug', 'info', 'warning', 'error', 'fatal']
const defaultOptions = {
  captureUnhandledRejections: true,
  logger: 'sentry'
}

const validator = Joi.object().keys({
  publicKey: Joi.string().required(),
  secretKey: Joi.string().required(),
  appId: Joi.string().required(),
  options: Joi.object().keys({
    release: Joi.string().required(),
    environment: Joi.string().required(),
    autoBreadcrumbs: Joi.boolean().optional()
  }).required()
})


const externals = {}

externals.Logger = (function () {
  function Logger () { }

  Logger.prototype.messages = {}
  Logger.prototype.exceptions = {}

  messages.forEach((messageType) => {
    Logger.prototype.messages[messageType] = function (message, context) {
      Raven.captureMessage(message, {
        level: messageType,
        extra: context || {}
      })
    }
  })

  exceptions.forEach((exceptionType) => {
    Logger.prototype.exceptions[exceptionType] = function (exception, context) {
      Raven.captureException(exception, {
        level: exceptionType,
        extra: context || {}
      })
    }
  })

  return Logger
}())

externals.install = function (params) {
  // Validate options passed
  const { error } = Joi.validate(params, validator)

  if (error) {
    throw error
  }

  const { publicKey, secretKey, appId, options } = params
  const url = `https://${publicKey}:${secretKey}@sentry.io/${appId}`
  const configuration = Object.assign({}, defaultOptions, options)

  Raven.config(url, configuration).install()
  process.on('uncaughtException', (e) => {
    Raven.captureException(e)
  })
}

module.exports = externals
