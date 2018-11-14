import {
  MongoClient,
  Db,
                              } from 'mongodb'

import {
  mongoUrl,
  dataServiceDB,
                              } from '../config/basic'
import log  from '../config/log';


class DataAccess {
  public static DB: Db
  public static async connect() {
    if (this.DB) return
    try {
      const db = (await MongoClient.connect(mongoUrl, { useNewUrlParser: true })).db(dataServiceDB)
      this.DB = db
      if (!db) {
        log.error('DataAccess', 'cannot connect to mongodb')
        return
      }
      log.info('DataAccess', 'connenct to mongodb success')
    } catch (error) {
      log.error('DataAccess', 'cannot connect to mongodb: %s', JSON.stringify(error))
    }
  }
}

setTimeout(async () => {
  await DataAccess.connect()
}, 1)

export default DataAccess
