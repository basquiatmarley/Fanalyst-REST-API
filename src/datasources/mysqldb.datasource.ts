import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {SequelizeDataSource} from '@loopback/sequelize';

const config = {
  name: 'mysqldb',
  user: process.env.DB_USER || 'root',
  connector: 'mysql',
  url: `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || 'root'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || 'fanalyst'}`,
  parseJsonColumns: true,
  sequelizeOptions: {
    dialectOptions: {}
  }
}
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
