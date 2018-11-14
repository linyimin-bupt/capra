import DataAccess             from './mongo-access'
import {
  Collection,
  InsertOneWriteOpResult,
                            } from 'mongodb'


const dbCollection = 'source-info'
export interface SourceInfoObj {
  _id?     : string,
  host     : string,   // The IP address or url of data source
  port?    : number,   // The port of dta source
  user?    : string,   // The owner of the data source,
  password?: string,   // The password of the owner
  type     : string,   // The type of data source(mysql, Hive, Hbase,...)
  cretaTime: number,
  name     : string,   // The name of data source
}


export class SourceInfo {
  public static async findAll(): Promise<SourceInfoObj[]> {
    const collection: Collection<SourceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.find({}).toArray()
  }

  public static async insertOne(doc: SourceInfoObj): Promise<InsertOneWriteOpResult> {
    const collection: Collection<SourceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.insertOne(doc)
  }

}
