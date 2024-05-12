import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'mysqldbJugler',
  connector: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'fanalyst',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  url: '',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MysqldbJuglerDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'mysqldbJugler';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mysqldbJugler', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
