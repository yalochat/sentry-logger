'use strict'

const Lab = require('lab')
const Code = require('code')
const Sinon = require('sinon')
const Raven = require('raven')
const { Logger, install } = require('../../lib')

const lab = exports.lab = Lab.script()
const { describe, it, before } = lab
const expect = Code.expect

describe('Logger utility, focus', () => {
  describe('install function', () => {
    it('call and install raven', (done) => {
      Sinon.spy(Raven, 'config')

      const publicKey = 'my-public-key'
      const secretKey = 'my-private-key'
      const appId = 'my-app-id'
      const url = `https://${publicKey}:${secretKey}@sentry.io/${appId}`

      install({
        publicKey,
        secretKey,
        appId,
        options: {
          environment: 'test',
          release: '0.0.1'
        }})

      const called = Raven.config.getCall(0)
      expect(called.args[0]).to.equal(url)

      Raven.config.restore()
      done()
    })
  })

  describe('Logger function', () => {
    const publicKey = process.env.SENTRY_PUBLIC_KEY
    const secretKey = process.env.SENTRY_SECRET_KEY
    const appId = process.env.SENTRY_APP_ID

    before((done) => {
      install({ publicKey, secretKey, appId, options: { environment: 'test', release: '0' } })
      done()
    })

    it('send warning message to Sentry', (done) => {
      const logger = new Logger()

      Sinon.spy(Raven, 'captureMessage')

      // Send warning message to Sentry
      const message = 'This is a warning message'
      const context = { date: new Date() }

      logger.messages.warning(message, context)

      const called = Raven.captureMessage.getCall(0)

      expect(called.args[0]).to.equal(message)
      expect(called.args[1].level).to.equal('warning')
      expect(called.args[1].extra).to.equal(context)
      // assert.deepEqual(called.args[1].extra, context, 'The field extra of metadata for message was not send correctly')

      Raven.captureMessage.restore()
      done()
    })

    it('send exception to Sentry', (done) => {
      const logger = new Logger()

      Sinon.spy(Raven, 'captureException')

      // Send warning message to Sentry
      const exception = new Error('this is a test exception')
      const context = { date: new Date() }
      logger.exceptions.error(exception, context)

      const called = Raven.captureException.getCall(0)

      expect(called.args[0]).to.equal(exception)
      expect(called.args[1].level).to.equal('error')
      expect(called.args[1].extra).to.equal(context)

      Raven.captureException.restore()
      done()
    })
  })
})

