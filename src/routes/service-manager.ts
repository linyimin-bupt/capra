import {
  default as express,
  Request,
  Response,
}                                 from 'express'
import {
  RegisterServiceInfo,
  InputParameterType,
  StatusCode,
  RegisterServiceInfoObj,
                              }   from '../data-access/register-service-info'

import log                        from '../config/log'
import { OutputParameterType }    from '../data-access/generate-service-info'

export const serviceManagerRouter = express.Router()

/**
 * @swagger
 *
 * /service-manager/all:
 *   get:
 *     tags:
 *       - ['service-manager']
 *     description: Get all services in the register
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
serviceManagerRouter.get('/all', async (_: Request, res: Response) => {
  try {
    const result = await RegisterServiceInfo.findAll()
    const registedServiceInfos = result.map(serviceInfo => {
      return  {
        name   : serviceInfo.name,
        des    : serviceInfo.description || '',
        state  : serviceInfo.status,
        project: serviceInfo.project || ''
      }
    })
    res.send({datum: registedServiceInfos, error: null})
  } catch (err) {
    res.send({datum: null, error: 'Get data error!'})
    log.error('/all', 'get data error: %s', JSON.stringify(err))
  }
})

/**
 * @swagger
 *
 * /service-manager/project:
 *   get:
 *     tags:
 *       - ['service-manager']
 *     description: Get all services in the register by project
 *     parameters:
 *       - name: projectName
 *         description: project name for geting all services' infomation.
 *         in: query
 *         required: false
 *         type: string
 *       - name: serviceName
 *         description: service name for geting it's infomation.
 *         in: query
 *         required: false
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
serviceManagerRouter.get('/project', async (req: Request, res: Response) => {
  const projectName = req.query.projectName
  const serviceName = req.query.serviceName

  if (! projectName && ! serviceName) {
    res.send({datum: null, error: 'Should specify the value of projectName or serviceName'})
    return
  }
  // TODO: Need to add project
  // TODO: Add response ?
  if (serviceName) {
    const serviceInfo = await RegisterServiceInfo.findByName(serviceName)
    if (serviceInfo) {
      res.send({
        datum: {
          basic: {
            name   : serviceName,
            project: serviceInfo.project || '',
            add: serviceInfo.address,
          },
          parameter: {
            basic: {
              method: serviceInfo.method,
              path  : serviceInfo.path,
              num   : serviceInfo.port || '80',
            },
            info: serviceInfo.parameter,
          },
          response: serviceInfo.response,
          statusCode: serviceInfo.statusCode || []
        },
        error: null,
      })
      return
    } else {
      res.send({datum: null, error: `Can't find the service with service's name: ${serviceInfo}`})
      return
    }
  }
  res.send({datum: null, error: 'You should specify the value of serviceName'})
})

/**
 * @swagger
 *
 * /service-manager/create:
 *   post:
 *     tags:
 *       - ['service-manager']
 *     description: create a service
 *     parameters:
 *       - name: project
 *         description: project name for geting all services' infomation.
 *         in: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - address
 *             - path
 *             - method
 *           properties:
 *             name:
 *               type: string
 *               description: The service name
 *             address:
 *               type: string
 *               description: The service address
 *             port:
 *               type: string
 *               description: The service port
 *             path:
 *               type: string
 *               description: The service path
 *             method:
 *               type: string
 *               description: The service method
 *             project:
 *               type: string
 *               description: The service belongs to which project
 *             parameter:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The parameter type
 *                   type:
 *                     type: string
 *                     description: The parameter type
 *                   description:
 *                     type: string
 *                     description: The parameter description
 *                   isRequired:
 *                     type: string
 *                     description: The parameter is required or not
 *
 *               description: The service parameter
 *             response:
 *               type: object
 *               description: The service name
 *               properties:
 *                 name:
 *                   type: string
 *             statusCode:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     description: The status number
 *                   info:
 *                     type: string
 *                     description: The information of status code
 *                   description:
 *                     type: string
 *                     description: The parameter description
 *             description:
 *               type: string
 *               description: Description of the service
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
interface ServiceInfo {
  name        : string,
  address     : string,
  path        : string,
  method      : string,
  port?       : string,
  project?    : string,
  parameter?  : InputParameterType[],
  response?   : OutputParameterType,
  statusCode? : StatusCode[],
  description?: string,
}
serviceManagerRouter.post('/create', async (req: Request, res: Response) => {
  const serviceInfo: ServiceInfo = req.body
  if (!serviceInfo.name) {
    res.send({datum: null, error: `name can't be null`})
    return
  }
  if (!serviceInfo.address) {
    res.send({datum: null, error: `address can't be null`})
    return
  }
  if (!serviceInfo.path) {
    res.send({datum: null, error: `path can't be null`})
    return
  }
  if (!serviceInfo.method) {
    res.send({datum: null, error: `method can't be null`})
    return
  }
  serviceInfo.port = serviceInfo.port || '80'

  const doc: RegisterServiceInfoObj = {
    ...serviceInfo,
    status: 0,
    createTime: Date.now(),
    modifyTime: 0,
  }

  try {
    await RegisterServiceInfo.insertOne(doc)
    res.send({datum: `Register ${serviceInfo.name} successed`, error: null})
  } catch (error) {
    res.send({datum: null, error:`Register service ${serviceInfo.name} failed.`})
    log.error('/create', 'register service failed: %s', JSON.stringify(error))
  }
})


/**
 * @swagger
 *
 * /service-manager/delete:
 *   get:
 *     tags:
 *       - ['service-manager']
 *     description: Get all services in the register by project
 *     parameters:
 *       - name: projectName
 *         description: project name for delete all services which in register.
 *         in: query
 *         required: false
 *         type: string
 *       - name: serviceName
 *         description: service name deleting.
 *         in: query
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
serviceManagerRouter.get('/delete', async (req: Request, res: Response) => {
  // TODO: Add project
  const serviceName = req.query.serviceName
  if (! serviceName) {
    res.send({datum: null, error: `serviceName should not be null`})
    return
  }
  try {
    await RegisterServiceInfo.deleteByName(serviceName)
    res.send({datum: `delete service ${serviceName} successed`, error: null})
  } catch (err) {
    res.send({datum: null, error: `delete service ${serviceName} failed`})
    log.error('/delete', 'delete service  failed: %s', JSON.stringify(err))
  }
})

/**
 * @swagger
 *
 * /service-manager/offline:
 *   get:
 *     tags:
 *       - ['service-manager']
 *     description: Get all services in the register by project
 *     parameters:
 *       - name: projectName
 *         description: project name for delete all services which in register.
 *         in: query
 *         required: false
 *         type: string
 *       - name: serviceName
 *         description: service name deleting.
 *         in: query
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
serviceManagerRouter.get('/offline', async (req: Request, res: Response) => {
  // TODO: Add project
  const serviceName = req.query.serviceName
  if (! serviceName) {
    res.send({datum: null, error: `serviceName should not be null`})
    return
  }
  try {
    await RegisterServiceInfo.updateByName(serviceName, {status: 2})
    res.send({datum: `offline service ${serviceName} successed`, error: null})
  } catch (err) {
    res.send({datum: null, error: `offline service ${serviceName} failed`})
    log.error('/offline', 'offline service failed: %s', JSON.stringify(err))
  }
})


/**
 * @swagger
 *
 * /service-manager/release:
 *   get:
 *     tags:
 *       - ['service-manager']
 *     description: Release a service
 *     parameters:
 *       - name: projectName
 *         description: project name for releasing service which in register.
 *         in: query
 *         required: false
 *         type: string
 *       - name: serviceName
 *         description: service name.
 *         in: query
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
serviceManagerRouter.get('/release', async (req: Request, res: Response) => {
  // TODO: Add project
  const serviceName = req.query.serviceName
  if (! serviceName) {
    res.send({datum: null, error: `serviceName should not be null`})
    return
  }
  try {
    await RegisterServiceInfo.updateByName(serviceName, {status: 1})
    res.send({datum: `release service ${serviceName} successed`, error: null})
  } catch (err) {
    res.send({datum: null, error: `release service ${serviceName} failed`})
    log.error('/release', 'release service failed: %s', JSON.stringify(err))
  }
})


/**
 * @swagger
 *
 * /service-manager/query:
 *   get:
 *     tags:
 *       - ['service-manager']
 *     description: Filter services in the register by project
 *     parameters:
 *       - name: projectName
 *         description: project name for delete all services which in register.
 *         in: query
 *         required: false
 *         type: string
 *       - name: serviceName
 *         description: service name deleting.
 *         in: query
 *         required: false
 *         type: string
 *       - name: status
 *         description: service status.
 *         in: query
 *         required: false
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 */
serviceManagerRouter.get('/query', async (req: Request, res: Response) => {
  const serviceName = req.query.serviceName
  const status      = parseInt(req.query.status)
  try {
    const result = await RegisterServiceInfo.findByNameAndStatus(serviceName, status)
    const serviceInfo = result.map(service => {
      return {
        name   : service.name,
        des    : service.description || '',
        state  : service.status,
        project: service.project || ''
      }
    })
    res.send({datum: serviceInfo ,error: null})
  } catch (err) {
    res.send({datum: null, error: `query service with ${serviceName} ${status} failed`})
    log.error('/query', 'query service failed: %s', JSON.stringify(err))
  }
})
