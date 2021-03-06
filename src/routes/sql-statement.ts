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
}                 from 'express'
import log        from '../config/log'
import { Mysql }  from '../data-access/source/mysql/mysql-access'

/**
 * Service's parameter type which generated by a sql statement
 */
export interface Parameter {
  name        : string,       // parameter name
  type        : string,       // parameter type
  defaultValue: any,          // default value of parameter
  description : string,       // description of parameter
}

/**
 * Service's response type, which is return in json format
 */
export interface SQLResult {
  [name: string]: string,    // response's name and type
}


export const sqlStatementRouter = express.Router()

/**
 * Generate a sql with related fields
 */

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
sqlStatementRouter.post('/generate', (req: Request, res: Response) => {
  const { select, from, where, groupBy, orderBy, limit } = req.body
  if (!select) {
    res.send({ error: `select field can't be null` })
    return
  }
  if (!where) {
    res.send({ error: `where field can't be null` })
    return
  }
  if (!from) {
    res.send({ error: `from field can't be null` })
    return
  }
  let sql = 'select '
  sql += select.join(',')
  sql += ' from '
  sql += from.join(' ,')
  sql += ' where '
  sql += where.join(' ')
  if (groupBy && groupBy.length > 0) {
    sql += ' group by '
    sql += groupBy.join(' ,')
  }
  if (orderBy && orderBy.length > 0) {
    sql += ' order by '
    sql += orderBy.join(' ,')
  }
  if (limit) {
    try {
      parseInt(limit, 10)
    } catch (error) {
      res.send({ error: 'limit field must be numberical' })
    }
    sql += ' limit ' + limit
  }
  log.info('sqlGenerate', 'sql:\n%s', sql)
  res.send({ sql, error: null })

})

/**
 * Test a sql statement
 * @param req
 * @param res
 */

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
sqlStatementRouter.get('/test', async (req: Request, res: Response) => {
  let sql: string = req.query.sql
  log.info(sql)
  const connection = await Mysql.getConnection()
  try {
    const result = await Mysql.query(sql, connection)
    res.send({ result })
  } catch (error) {
    res.send({ error })
  }
})