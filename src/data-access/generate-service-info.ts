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
export interface GenerateServiceInfoObj {
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


export class GenerateServiceInfo {
  public static async findAll(): Promise<GenerateServiceInfoObj[]> {
    const collection: Collection<GenerateServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.find({}).toArray()
  }

  public static async insertOne(doc: GenerateServiceInfoObj): Promise<InsertOneWriteOpResult> {
    const collection: Collection<GenerateServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.insertOne(doc)
  }
  public static async findByPath(path: string): Promise<GenerateServiceInfoObj | null> {
    const collection: Collection<GenerateServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.findOne({ path })
  }
}
