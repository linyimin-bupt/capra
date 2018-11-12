/**
 * Module dependencies
 */

/**
 * Public node modules
 */
import * as bodyParser  from 'body-parser'
import express          from 'express'

/**
 * Private node modules
 */
import log              from './config/log'
import * as database    from './routes/mysql-metadata'
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/**
 * database meta data
 */

app.get('/databases', database.getAll)
app.get('/databases/tables', database.getAlltables)
app.get('/databases/tables/:name', database.getTableFields)

const PORT = process.env.LISTEN_PORT || 5000
app.listen(PORT, () => {
  log.info(`Listening port ${PORT}`)
})