/**
 * Module dependencies
 */

/**
 * Public node modules
 */
import * as bodyParser                  from 'body-parser'
import express                          from 'express'
import session                          from 'express-session'
import cookieParser                     from 'cookie-parser'

/**
 * Private node modules
 */
import log                              from './config/log'
import * as database                    from './routes/mysql-metadata'
import { sessionConfig }                from './config/session-config'
import {
  sqlStatementRouter,
}                                       from './routes/sql-statement'
import {
  serviceRouter,
  generatingServiceInit,
  serviceGenerateRouter,
}                                       from './routes/service-generate'
import { syncMetaData }                 from './cache/mysql-metadata'
import * as  swaggerUi                  from 'swagger-ui-express'
import { getSwaggerJson }               from './routes/swagger-ui'
import { serviceManagerRouter }         from './routes/service-manager'
import { serviceConsumeRouter }         from './routes/service-consume'

/**
 * Generate servce
 */
const generateServiceApp = express()

// Data service app
const generatedServiceExecuteApp = express()

// service manager app

const serviceManagerApp = express()

// service consume app

const serviceConsumeApp = express()

generateServiceApp.all('*',function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next()
})

generatedServiceExecuteApp.all('*',function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next()
})

serviceManagerApp.all('*',function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next()
})

serviceConsumeApp.all('*',function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next()
})

generateServiceApp.use(bodyParser.urlencoded({ extended: true }))
generateServiceApp.use(bodyParser.json())
generateServiceApp.use(session(sessionConfig))
generateServiceApp.use(cookieParser())
generateServiceApp.use('/databases', database.mysqlMetadataRouter)
generateServiceApp.use('/sql', sqlStatementRouter)
generateServiceApp.use('/service', serviceGenerateRouter)

/**
 * Generate swagger file and display with swagger ui
 */
generateServiceApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getSwaggerJson('dev.json')))


generatedServiceExecuteApp.use(bodyParser.urlencoded({ extended: true }))
generatedServiceExecuteApp.use(bodyParser.json())
generatedServiceExecuteApp.use(serviceRouter)

serviceManagerApp.use(bodyParser.urlencoded({ extended: true }))
serviceManagerApp.use(bodyParser.json())
serviceManagerApp.use('/service-manager', serviceManagerRouter)

serviceConsumeApp.use(bodyParser.urlencoded({ extended: true }))
serviceConsumeApp.use(bodyParser.json())
serviceConsumeApp.use(serviceConsumeRouter);

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

const PORT = process.env.LISTEN_PORT || 5000
generateServiceApp.listen(PORT, () => {
  log.info(`generateServiceApp Listening port ${PORT}`)
})


generatedServiceExecuteApp.listen(5001, function() {
  log.info(`generatedServiceExecuteApp Listening service port 5001`)
})

serviceManagerApp.listen(5002, function() {
  log.info(`serviceManagerApp Listening service port 5002`)
})

serviceConsumeApp.listen(5003, function() {
  log.info(`serviceManagerApp Listening service port 5002`)
})