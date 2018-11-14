
/**
 * Module dependencies
 */

/**
 * Node.js core
 */

/**
 * Public node moudules
 */
import * as env     from 'dotenv'
import {
  ConnectionOptions,
  default as mysql,
  PoolConfig,
  PoolConnection,
  QueryOptions,
                  } from 'mysql'
import log          from '../../config/log'

// Read config from .env
env.config()

const poolConfig: PoolConfig = {
  connectionLimit: parseInt(process.env.CONNECTION_LIMIT || '10', 10),
  host           : process.env.HOST || '127.0.0.1',
  password       : process.env.PASSWORD || 'test',
  port           : parseInt(process.env.PORT || '3306', 10),
  user           : process.env.DATABASE_USER || 'test',
}

/**
 * Create a mysql connection pool
 */
const pool = mysql.createPool(poolConfig)

/**
 * Expose main operations of the mysql
 */
export class Mysql {

  public static async getConnection (options?: ConnectionOptions): Promise<PoolConnection> {
    return new Promise<PoolConnection>((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          return reject(err)
        }
        if (!options) {
          log.info('Mysql', 'Get a connection, threadId = %s', connection.threadId)
          return resolve(connection)
        }
        connection.changeUser(options, error => {
          if (error) {
            return reject(error)
          }
          resolve(connection)
          log.info('Mysql', 'Get a specified connection, threadId = %s, userInfo = %s', connection.threadId, JSON.stringify(options))
        })
      })
    })
  }

  public static async query (options: string | QueryOptions, connection: PoolConnection): Promise<any>

  public static async query (options: string, values: any, connection: PoolConnection): Promise<any>

  public static async query (...args: any[]): Promise<any> {
    const connection: PoolConnection = args[args.length - 1]
    return new Promise<any>((resove, reject) => {
      switch (args.length) {
        case 2 : {
          connection.query(args[0], (error, results) => {
            if (error) {
              reject(error)
            }
            resove(results)
            connection.release()
          } )
          break
        }
        case 3 : {
          connection.query(args[0], args[1], (error, results) => {
            if (error) {
              reject(error)
            }
            resove(results)
            connection.release()
          } )
          break
        }
        default: {
          connection.release()
          throw new Error(`Mysql query funtion should get 1-2 parameters`)
        }
      }
    })
  }
}
/**
 * When receive the Ctrl + C signal
 * Closing all the connection in a pool
 */
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      return log.error('Mysql', 'Closing all the connection in the pool fail: %s', JSON.stringify(err))
    }
    log.info('Mysql', 'Closing all the conneciotn in the pool')
    process.exit(0)
  })
})
