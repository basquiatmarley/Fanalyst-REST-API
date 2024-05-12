import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Banner, BannerRelations} from '../models';

export class BannerRepository extends SequelizeCrudRepository<
  Banner,
  typeof Banner.prototype.id,
  BannerRelations
> {
  constructor(@inject('datasources.mysqldb') dataSource: MysqldbDataSource) {
    super(Banner, dataSource);
  }
}
