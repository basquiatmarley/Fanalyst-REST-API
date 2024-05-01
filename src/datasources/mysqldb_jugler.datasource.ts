import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'mysqldbauth',
  connector: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 8889,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'fanalyst',
};


@lifeCycleObserver('datasource')
export class MysqldbDataJuglerSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mysqldbauth';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mysqldbauth', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
