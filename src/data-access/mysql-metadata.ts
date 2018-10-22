/**
 * Module Dependencies
 */

/**
 * Node.js core
 */

/**
 * Public node modules
 */

/**
 * Private node modules
 */
import { Mysql } from './mysql-access'

export interface TableMetadata {
  columName       : string,
  isNullAble      : string,
  columnType      : string,
  characterSetName: string,
  columnKey       : string,
  privileges      : string,
  columnComment   : string,
}

/**
 * Get mysql related metadata
 */
export class MysqlMetadata {
  /**
   * Get all databases' name from specified host
   */
  public static async getAllDatabases (): Promise<string[]> {
    const connection = await Mysql.getConnection()
    return new Promise<string[]>(async (resolve, reject) => {
      try {
        const results = await Mysql.query('show databases;', connection) as any[]
        const databases = results.map(result => {
          return result.Database
        })
        resolve(databases)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Get all tables' name from specified database
   * @param database
   */
  public static async getAllTables (database: string): Promise<string[]> {
    const connection = await Mysql.getConnection({ database })
    return new Promise<string[]>(async (resolve, reject) => {
      try {
        const results = await Mysql.query('show tables;', connection) as any[]
        const tables = results.map(result => {
          return result.Tables_in_mysql
        })
        resolve(tables)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Get specified table meta infomation
   * @param database
   * @param table
   */
  public static async getTableFields (database: string, table: string): Promise<TableMetadata[]> {
    const connection = await Mysql.getConnection({ database })
    return new Promise<TableMetadata[]>(async (resolve, reject) => {
      try {
        const sql = `SELECT
          COLUMN_NAME,
          IS_NULLABLE,
          COLUMN_TYPE,
          CHARACTER_SET_NAME,
          COLUMN_KEY,
          PRIVILEGES,
          COLUMN_COMMENT
          from information_schema.columns WHERE table_name=?`
        const results = await Mysql.query(sql, table, connection) as any[]
        const tableMetadatas: TableMetadata[] = results.map(result => {
          const meta: TableMetadata = {
            characterSetName: result.CHARACTER_SET_NAME as string,
            columName       : result.COLUMN_NAME as string,
            columnComment   : result.COLUMN_COMMENT as string,
            columnKey       : result.COLUMN_KEY as string,
            columnType      : result.COLUMN_TYPE as string,
            isNullAble      : result.IS_NULLABLE as string,
            privileges      : result.PRIVILEGES as string
          }
          return meta
        })
        resolve(tableMetadatas)
      } catch (err) {
        reject(err)
      }
    })
  }
}
