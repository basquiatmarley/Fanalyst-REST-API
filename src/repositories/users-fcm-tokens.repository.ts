import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {UsersFcmTokens, UsersFcmTokensRelations} from '../models';

export class UsersFcmTokensRepository extends SequelizeCrudRepository<
  UsersFcmTokens,
  typeof UsersFcmTokens.prototype.id,
  UsersFcmTokensRelations
> {
  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
  ) {
    super(UsersFcmTokens, dataSource);
  }
}
