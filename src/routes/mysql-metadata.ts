/**
 * Module dependencies
 */

 /**
  * Public node modules
  */
import {
  default as express,
  Request,
  Response,
} from 'express'

/**
 * Private node modules
 */
import log               from '../config/log'
import { MysqlMetadata } from '../data-access/source/mysql/mysql-metadata'

export const mysqlMetadataRouter = express.Router()

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
mysqlMetadataRouter.get('/', async (_: Request, res: Response) => {
  try {
    const result = await MysqlMetadata.getAllDatabases()
    res.status(200)
    res.json({ databases: result })
  } catch (err) {
    res.status(500)
    res.json({ error: err })
  }
})

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
mysqlMetadataRouter.get('/tables', async (req: Request, res: Response) => {
  const databaseName = req.query.databaseName
  try {
    const result = await MysqlMetadata.getAllTables(databaseName)
    res.status(200)
    res.json({ tables: result })
  } catch (err) {
    res.status(500)
    res.json({ error: err })
  }
})

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
mysqlMetadataRouter.get('/tables/:name', async (req: Request, res: Response) => {
  const tableName    = req.params.name
  const databaseName = req.query.databaseName
  log.info(tableName, databaseName)
  try {
    const result = await MysqlMetadata.getTableFields(databaseName, tableName)
    res.status(200)
    res.json({ tableFields: result })
  } catch (err) {
    res.status(500)
    res.json({ error: err })
  }
})
