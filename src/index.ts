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

app.all('*',function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next()
})

serviceApp.all('*',function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session(sessionConfig))
app.use(cookieParser())


serviceApp.use(bodyParser.urlencoded({ extended: true }))
serviceApp.use(bodyParser.json())


/**
 * @swagger
 *
 * /databases:
 *   get:
 *     description: Get All mysql databases
 *     tags:
 *       - ['databases']
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/databases', database.getAll)

/**
 * @swagger
 *
 * /databases/tables:
 *   get:
 *     tags:
 *       - ['databases']
 *     description: Get all tables' name from a database
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: databaseName
 *         description: database name to database for geting all tables.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/databases/tables', database.getAlltables)

/**
 * @swagger
 *
 * /databases/tables/{name}:
 *   get:
 *     tags:
 *       - ['databases']
 *     description: Get all tables' fields from a table
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Table name to table for geting all fields.
 *         in: path
 *         required: true
 *         type: string
 *       - name: databaseName
 *         description: database name to database for geting all tables.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/databases/tables/:name', database.getTableFields)

/**
 * SQL statements
 */

/**
 * @swagger
 *
 * /sql/generate:
 *   post:
 *     tags:
 *       - ['sql']
 *     description: Generate a sql statement
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: select
 *         in: body
 *         description: Target field want to get
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: from
 *         in: body
 *         description: database and table names
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: where
 *         in: body
 *         description: Condition of sql
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: groupBy
 *         in: body
 *         description: Group by condition
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: orderBy
 *         in: body
 *         description: Order by condition
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: limit
 *         in: body
 *         description: limit
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: OK
 */
app.post('/sql/generate', sqlGenerate)

/**
 * @swagger
 *
 * /sql/test:
 *   get:
 *     tags:
 *       - ['sql']
 *     description: Test generated sql
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sql
 *         description: A sql staetment.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OK
 */
app.get( '/sql/test', sqlTest)


/**
 * Data service generate
 */

/**
 * @swagger
 *
 * /service/parameter-type:
 *   get:
 *     tags:
 *       - ['service']
 *     description: Get parameters' type and responses' type
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sql
 *         description: A sql staetment.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OK
 */
app.get( '/service/parameter-type', serviceTypeGenerate)

/**
 * @swagger
 *
 * /service/generate:
 *   get:
 *     tags:
 *       - ['service']
 *     description: Get parameters' type and responses' type
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: method
 *         description: The request method of the service which will be generated.
 *         in: query
 *         required: true
 *         type: string
 *       - name: path
 *         description: The URL of the service.
 *         in: query
 *         required: true
 *         type: string
 *       - name: name
 *         description: The name of the service.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OK
 */
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