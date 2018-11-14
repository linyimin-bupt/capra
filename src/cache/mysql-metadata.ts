import { MysqlMetadata } from '../data-access/source/mysql-metadata'


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
export interface TableObj {
  [tableName: string]: FieldObj
}

export interface DatabaseObj {
  [databaseName: string]: TableObj,
}

export const metaDataCache = new Map<string, DatabaseObj>()

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
