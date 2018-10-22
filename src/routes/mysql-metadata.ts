/**
 * Module dependencies
 */

 /**
  * Public node modules
  */
import {
  Request,
  Response,
} from 'express'

/**
 * Private node modules
 */
import log               from '../config/log'
import { MysqlMetadata } from '../data-access/mysql-metadata'
export const getAll = async (_: Request, res: Response) => {
  try {
    const result = await MysqlMetadata.getAllDatabases()
    res.status(200)
    res.json({ databases: result })
  } catch (err) {
    res.status(500)
    res.json({ error: err })
  }
}

export const getAlltables = async (req: Request, res: Response) => {
  const databaseName = req.query.databaseName
  try {
    const result = await MysqlMetadata.getAllTables(databaseName)
    res.status(200)
    res.json({ tables: result })
  } catch (err) {
    res.status(500)
    res.json({ error: err })
  }
}

export const getTableFields = async (req: Request, res: Response) => {
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
}
