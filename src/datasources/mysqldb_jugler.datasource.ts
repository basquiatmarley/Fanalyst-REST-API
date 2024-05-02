import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const configDb = {
  name: 'mysqldbauth',
  connector: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 8889,
  database: process.env.DB_NAME || 'fanalyst',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  connectTimeout: 2000000,
};


@lifeCycleObserver('datasource')
export class MysqldbDataJuglerSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mysqldbauth';
  static readonly defaultConfig = configDb;

  constructor(
    @inject('datasources.config.mysqldbauth', {optional: true})
    dsConfig: object = configDb,
  ) {
    super(dsConfig);
  }
}
