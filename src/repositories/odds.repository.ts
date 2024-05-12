import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Odds, OddsRelations} from '../models';

export class OddsRepository extends SequelizeCrudRepository<
  Odds,
  typeof Odds.prototype.id,
  OddsRelations
> {
  constructor(@inject('datasources.mysqldb') dataSource: MysqldbDataSource) {
    super(Odds, dataSource);
  }
}
