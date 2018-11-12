/**
 * Module dependencies
 */

/**
 * Public node modules
 */
import * as bodyParser  from 'body-parser'
import express          from 'express'
import session          from 'express-session'
import cookieParser    from 'cookie-parser'

/**
 * Private node modules
 */
import log                    from './config/log'
import * as database          from './routes/mysql-metadata'
import { sessionConfig }      from './config/session-config'
import {
  sqlGenerate,
  sqlTest,
}                       from './routes/sql-statement'
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session(sessionConfig))
app.use(cookieParser())

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

const PORT = process.env.LISTEN_PORT || 5000
app.listen(PORT, () => {
  log.info(`Listening port ${PORT}`)
})
