/**
 * Module dependencies
 */

/**
 * Public node modules
 */
import * as bodyParser        from 'body-parser'
import express                from 'express'
import session                from 'express-session'
import cookieParser           from 'cookie-parser'

/**
 * Private node modules
 */
import log                    from './config/log'
import * as database          from './routes/mysql-metadata'
import { sessionConfig }      from './config/session-config'
import {
  sqlGenerate,
  sqlTest,
}                             from './routes/sql-statement'
import {
  serviceGenerate,
  serviceRouter,
  serviceTypeGenerate,
  generatingServiceInit,
}                             from './routes/service-generate'
import { syncMetaData }       from './cache/mysql-metadata'
import * as  swaggerUi        from 'swagger-ui-express'
import { getSwaggerJson }     from './routes/swagger-ui'
const app = express()
// Data service app
const serviceApp = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session(sessionConfig))
app.use(cookieParser())


serviceApp.use(bodyParser.urlencoded({ extended: true }))
serviceApp.use(bodyParser.json())


/**
 * @swagger
 *
 * /login:
 *   post:
 *     description: Login to the application
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: Username to use for login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: login
 */
app.get('/databases', database.getAll)
app.get('/databases/tables', database.getAlltables)
app.get('/databases/tables/:name', database.getTableFields)

/**
 * SQL statements
 */
app.post('/sql/generate', sqlGenerate)
app.get( '/sql/test', sqlTest)


/**
 * Data service generate
 */
app.get( '/service/parameter-type', serviceTypeGenerate)
app.post('/service/generate',       serviceGenerate)

/**
 * Generate swagger file and display with swagger ui
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getSwaggerJson('dev.json')))

const PORT = process.env.LISTEN_PORT || 5000
app.listen(PORT, () => {
  log.info(`Listening port ${PORT}`)
})

serviceApp.use(serviceRouter);

/**
 * init
 */
(async () => {
  /**
   * init: Sync meta data
   */
  await syncMetaData('mysql')

  /**
   * init generating services
   */
  await generatingServiceInit()

})()

serviceApp.listen(8000, function() {
  log.info(`Listening service port 8000`)
})