import * as dot from 'dotenv'

dot.config()

export const dataServiceDB = 'dataService'
export const mongoUrl      = 'mongodb://123.56.87.74:27017'
export const drillUrl      = `http://${process.env.DrillHost}:${process.env.DrillPort}/query.json`