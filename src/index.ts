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
 * database meta data
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