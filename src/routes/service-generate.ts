import {
  Request,
  Response,
  default as express,
}                           from 'express'
import {
  parseColumns,
  parseFrom,
  parseWhere,
  sqlParameterized,
  parseLimit,
}                           from '../util/sql-parser'
import {
  InputParameterType,
  OutputParameterType,
  GenerateServiceInfo,
}                           from '../data-access/generate-service-info';
import { Mysql }            from '../data-access/source/mysql/mysql-access'

const METHOD = {
  get   : 'lym',
  post  : 'lym',
  put   : 'lym',
  delete: 'lym',
}

type METHOD_NAME = keyof typeof METHOD

interface ServiceParameterCache {
  parameters: InputParameterType[],
  response  : OutputParameterType,
  sql       : string,
}
// string is the session id
const serviceParameterCache = new Map<string, ServiceParameterCache>()

export const serviceRouter         = express.Router()

export const serviceGenerateRouter = express.Router()

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
serviceGenerateRouter.get('/parameter-type', (req: Request, res: Response) => {
  const sql    = req.query.sql
  const select = parseColumns(sql)
  const from   = parseFrom(sql)
  const where  = parseWhere(sql)
  const limit  = parseLimit(sql)
  let   response : OutputParameterType = {}
  const parameters: InputParameterType[] = new Array<InputParameterType>()
  select.map(column => {
    const columnName = column.name
    response[column.alias ? column.alias : columnName] = 'string'
  })

  where.map(column => {
    let parameter: InputParameterType = {
      name: column.column,
      defaultValue: column.defaultValue,
      type: 'string',
      description: `from ${from[0].table}`
    }
    parameters.push(parameter)
  })
  if (limit.value) {
    parameters.push({
      name: 'limit',
      defaultValue: limit.value,
      type: 'number',
      description: `limit keyword`
    })
  }
  res.send({ parameters, response, sessionID: req.sessionID!, error: null })
  // cache for service register
  serviceParameterCache.set(req.sessionID!, { parameters, response, sql })
})

/**
 * @swagger
 *
 * /service/generate:
 *   post:
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
serviceGenerateRouter.post('/generate', async (req: Request, res: Response) => {
  let { method, path, name, project, description, sessionID } = req.body
  method = method.toLocaleLowerCase()
  serviceRouter[method as METHOD_NAME](path, sqlExecute)
  const data = serviceParameterCache.get(sessionID)
  if (!data) {
    res.send( {error: 'no related type data'} )
    return
  }
  await GenerateServiceInfo.insertOne({
    input      : data.parameters,
    output     : data.response,
    sql        : sqlParameterized(data.sql),
    createTime : Date.now(),
    modifyTime : 0,
    path       : path,
    name       : name,
    method     : method,
    project    : project,
    description: description,
  })
  res.send({error: null, result: `Generate service ${path} success`})

})


async function sqlExecute(req: Request, res: Response) {
  const path = req.url
  const body = req.body
  console.log(body)
  const value = new Array()
  const serviceInfo = await GenerateServiceInfo.findByPath(path)
  serviceInfo!.input.map(parameter => {
    if (body[parameter.name]){
      value.push(body[parameter.name])
    } else {
      value.push(parameter.defaultValue)
    }
  })
  const connection = await Mysql.getConnection()
  const result = await Mysql.query(serviceInfo!.sql, value, connection)
  res.send(result)
}


// Put all generating services into router
export const generatingServiceInit = async () => {
  const services = await GenerateServiceInfo.findAll()
  services.map(service => {
    serviceRouter[service.method as METHOD_NAME](service.path, sqlExecute)
  })
}