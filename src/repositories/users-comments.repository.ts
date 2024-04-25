import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {UsersComments, UsersCommentsRelations} from '../models';

export class UsersCommentsRepository extends SequelizeCrudRepository<
  UsersComments,
  typeof UsersComments.prototype.id,
  UsersCommentsRelations
> {
  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
  ) {
    super(UsersComments, dataSource);
  }
}
