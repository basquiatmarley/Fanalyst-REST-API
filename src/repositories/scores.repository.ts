import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Scores, ScoresRelations} from '../models';

export class ScoresRepository extends SequelizeCrudRepository<
  Scores,
  typeof Scores.prototype.id,
  ScoresRelations
> {
  constructor(@inject('datasources.mysqldb') dataSource: MysqldbDataSource) {
    super(Scores, dataSource);
  }
}
