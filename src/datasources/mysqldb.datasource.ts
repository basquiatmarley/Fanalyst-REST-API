import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {SequelizeDataSource} from '@loopback/sequelize';

const config = {
  name: 'mysqldb',
  connector: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'fanalyst',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  connectTimeout: 2000000,
  sequelizeOptions: {
    connectTimeout: 20000000,
    timeout: 20000000,
  },
};
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
