import { MysqlMetadata } from '../data-access/source/mysql-metadata'


/**
 * Fields' properties
 */
export interface FieldObj {
  [name: string]: {
    isNullAble      : string,
    columnType      : string,
    characterSetName: string,
    columnKey       : string,
    privileges      : string,
    columnComment   : string,
  }
}
/**
 * Table's fields
 */
export interface TableObj {
  [tableName: string]: FieldObj
}

/**
 * Database's tables
 */
export interface DatabaseObj {
  [databaseName: string]: TableObj,
}

export const metaDataCache = new Map<string, DatabaseObj>()

/**
 * Get the source meta data, and store in metaDataCase
 * @param source
 */
export const syncMetaData = async (source: string) => {
  if (metaDataCache.get(source)) {
    return
  }
  const databases = await MysqlMetadata.getAllDatabases()
  let databaseMetaData: DatabaseObj = {}
  for (let i = 0; i < databases.length; i++) {
    const tables = await MysqlMetadata.getAllTables(databases[i])
    let tableMetaData: TableObj = {} as TableObj
    for (let j = 0; j < tables.length; j++) {
      const fields = await MysqlMetadata.getTableFields(databases[i], tables[j])
      tableMetaData[tables[j]] = {}
      fields.map(field => {

        tableMetaData[tables[j]][field.columName] = {
          isNullAble      : field.isNullAble,
          columnType      : field.columnType,
          characterSetName: field.characterSetName,
          columnKey       : field.columnKey,
          privileges      : field.privileges,
          columnComment   : field.columnComment,
        }

      })
    }
    databaseMetaData[databases[i]] = tableMetaData
  }
  metaDataCache.set(source, databaseMetaData)
}

// TODO: update the metaDataCase when some info change
