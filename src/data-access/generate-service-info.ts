import DataAccess             from './mongo-access'
import {
  Collection,
  InsertOneWriteOpResult,
                            } from 'mongodb'

export interface InputParameterType {
  name        : string,
  type        : string,
  defaultValue: any,
  description : string,
}

export interface OutputParameterType {
  [name: string]: string,
}

const dbCollection = 'generated-service-info'
export interface ServiceInfoObj {
  _id?        : string,
  input       : InputParameterType[],
  output      : OutputParameterType,
  sql         : string,
  createTime  : number,
  modifyTime  : number,
  path        : string,
  name        : string,
  method      : string,
  project?    : string,
  description?: string,
}


export class ServiceInfo {
  public static async findAll(): Promise<ServiceInfoObj[]> {
    const collection: Collection<ServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.find({}).toArray()
  }

  public static async insertOne(doc: ServiceInfoObj): Promise<InsertOneWriteOpResult> {
    const collection: Collection<ServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.insertOne(doc)
  }
  public static async findByPath(path: string): Promise<ServiceInfoObj | null> {
    const collection: Collection<ServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.findOne({ path })
  }
}
