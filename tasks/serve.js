'use strict'

const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const bucker = require('bucker')

const logger = bucker.createLogger({ name: '/tasks/serve' })

gulp.task('serve', ['watch'], () => {
  nodemon({
    script: 'server',
    ext: 'html js'
  }).on('start', () => {
    logger.info(`Server task has been started!`)
  })
})
