import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {SportsGroups, SportsGroupsRelations} from '../models';

export class SportsGroupsRepository extends SequelizeCrudRepository<
  SportsGroups,
  typeof SportsGroups.prototype.id,
  SportsGroupsRelations
> {
  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
  ) {
    super(SportsGroups, dataSource);
  }
}
