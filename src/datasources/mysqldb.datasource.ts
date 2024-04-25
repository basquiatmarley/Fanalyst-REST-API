import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {SequelizeDataSource} from '@loopback/sequelize';

const config = {
  dialect: 'mysql',
  name: 'mysqldb',
  connector: 'mysql',
  sequelizeOptions: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 8889,
    database: process.env.DB_NAME || 'fanalyst',
  },
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MysqldbDataSource extends SequelizeDataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mysqldb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mysqldb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
