/**
 * Display swagger json file using swagger-ui-express
 */

import {
  baseDir,
  SwaggerOption,
  generateSwaggerFile
}                   from '../util/swagger-json-generated'

import * as path from 'path'
export const getSwaggerJson = function (filename: string) {
  const options: SwaggerOption = {
    swaggerDefinition: {
      swagger: '2.0',
      info: {
        title: 'Distributed Big Data service Open Platform',
        version: '1.0.0',
        description: 'Distributed Big Data service Open Platform back-end API',
        contact:{
          name: 'Yimin Lin',
          email: 'linyimin520812@gmail.com'
        }
      },
      host: `localhost:5000`,
      basePath: '/',
    },
     apis: [path.join(__dirname, './*.ts')]
}
  generateSwaggerFile(options, `${filename}`)
  const docs = require(`${baseDir}/${filename}`)
  return docs
}