import swagger  from 'swagger-jsdoc'
import fs       from 'fs'
import path     from 'path'
import log      from '../config/log'
export interface SwaggerOption {
  definition: {                       // Information of the swagger file
    info: {
      title       : string,
      version     : string,
      description?: string,
      contact?: {
        name  : string,
        url?  : string,
        email?: string,
      }
    }
  },
  apis: string[],                     // Path to the API docs
}

const baseDir = path.join(
  __dirname,
  path.sep,
  '..',
  path.sep,
  '..',
  'swagger',
)

/**
 * generate swagger file using jsdoc
 * @param options
 * @param filename  The generated file name, default to swagger.json, stores in swagger directory
 */
export const generateSwaggerFile = function (options: SwaggerOption, filename?: string) {
  const swaggerSpec = swagger(options)
  if (! fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir)
  }
  fs.writeFileSync(`${baseDir}/${filename ? filename : 'swagger.json'}`, JSON.stringify(swaggerSpec))
  log.info('generateSwaggerFile', 'generates swagger file: %s', `${baseDir}/${filename ? filename : 'swagger.json'}`)
}
