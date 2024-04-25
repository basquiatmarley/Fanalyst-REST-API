import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {UsersPredictions, UsersPredictionsRelations} from '../models';

export class UsersPredictionsRepository extends SequelizeCrudRepository<
  UsersPredictions,
  typeof UsersPredictions.prototype.id,
  UsersPredictionsRelations
> {
  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
  ) {
    super(UsersPredictions, dataSource);
  }
}
