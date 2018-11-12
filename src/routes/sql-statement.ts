/**
 * Module dependencies
 */

/**
 * Public node modules
 */

import {
  Request,
  Response,
}                 from 'express'
import log        from '../config/log'
import { Mysql }  from '../data-access/mysql-access'

export interface Parameter {
  name        : string,       // 参数名称
  type        : string,       // 参数类型
  defaultValue: any,          // 默认值
  description : string,       // 参数描述
}

export interface SQLResult {
  name: string,               // 返回值名称
  type: string,               // 返回值类型
}
export const sqlGenerate = (req: Request, res: Response) => {
  const { select, from, where, groupBy, orderBy, limit } = req.body
  if (!select) {
    res.send({ error: 'select对应的字段不能为空' })
    return
  }
  if (!where) {
    res.send({ error: 'where对应的字段不能为空' })
    return
  }
  if (!from) {
    res.send({ error: 'from对应的字段不能为空' })
    return
  }
  let sql = 'select \n'
  sql += select.join(',\n')
  sql += '\nfrom\n'
  sql += from.join(',\n')
  sql += '\nwhere\n'
  sql += where.join('\n')
  if (groupBy) {
    sql += '\ngroup by\n'
    sql += groupBy.join(',\n')
  }
  if (orderBy) {
    sql += '\norder by\n'
    sql += orderBy.join(',\n')
  }
  if (limit) {
    try {
      parseInt(limit, 10)
    } catch (error) {
      res.send({ error: 'limit字段必须为数字' })
    }
    sql += '\nlimit ' + limit.join('')
  }
  log.info('sqlGenerate', 'sql: %s', sql)
  res.send({ sql, error: null })

  // 处理输入输出
}

export const sqlTest = async (req: Request, res: Response) => {
  let sql: string = req.query.sql
  sql = sql.replace(/\\n/g, ' ')
  log.info(sql)
  const connection = await Mysql.getConnection()
  try {
    const result = await Mysql.query(sql, connection)
    res.send({ result })
  } catch (error) {
    res.send({ error })
  }
}
