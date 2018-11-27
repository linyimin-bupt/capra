import { Etcd3 }    from 'etcd3'
import * as env     from 'dotenv'

env.config()

export const etcdClient = new Etcd3({
  hosts: `${process.env.EtcdHost || '127.0.0.1'}:${process.env.EtcdPort || '2379'}`
})