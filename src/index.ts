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
  sqlStatementRouter,
}                             from './routes/sql-statement'
import {
  serviceRouter,
  generatingServiceInit,
  serviceGenerateRouter,
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



app.use('/databases', database.mysqlMetadataRouter)

app.use('/sql', sqlStatementRouter)

app.use('/service', serviceGenerateRouter)

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