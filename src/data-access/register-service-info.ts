import DataAccess             from './mongo-access'
import {
  Collection,
  InsertOneWriteOpResult,
  UpdateWriteOpResult,
  DeleteWriteOpResultObject,
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

export interface StatusCode {
  status      : string,
  info        : string,
  description?: string,
}

const dbCollection = 'registed-service-info'
export interface RegisterServiceInfoObj {
  _id?        : string,
  parameter?  : InputParameterType[],
  response?   : OutputParameterType,
  name        : string,
  address     : string,
  port?       : string,
  path        : string,
  method      : string,
  statusCode? : StatusCode[],
  project?    : string,
  description?: string,
  status      : number,
  createTime  : number,
  modifyTime  : number,
}

export class RegisterServiceInfo {
  public static async findAll(): Promise<RegisterServiceInfoObj[]> {
    const collection: Collection<RegisterServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.find({}).toArray()
  }

  public static async insertOne(doc: RegisterServiceInfoObj): Promise<InsertOneWriteOpResult> {
    const collection: Collection<RegisterServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.insertOne(doc)
  }
  public static async findByName(name: string): Promise<RegisterServiceInfoObj | null> {
    const collection: Collection<RegisterServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.findOne({ name })
  }

  public static async updateByName(name: string, doc: any): Promise<UpdateWriteOpResult> {
    const collection: Collection<RegisterServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.updateOne({ name }, { $set: doc })
  }

  public static async deleteByName(name: string): Promise<DeleteWriteOpResultObject> {
    const collection: Collection<RegisterServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    return await collection.deleteOne({ name })
  }

  public static async findByNameAndStatus(name?: string, status?: number): Promise<RegisterServiceInfoObj[]> {
    const collection: Collection<RegisterServiceInfoObj> = DataAccess.DB.collection(dbCollection)
    let result: RegisterServiceInfoObj[] = []
    if (name && status! >= 0) {
      result = await collection.find({name, status}).toArray()
    } else if (name) {
      result = await collection.find({name}).toArray()
    } else if (status! >= 0) {
      result = await collection.find({status}).toArray()
    }
    return result
  }
}
