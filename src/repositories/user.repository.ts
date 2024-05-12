import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Users, UsersRelations} from '../models';

export class UsersRepository extends SequelizeCrudRepository<
  Users,
  typeof Users.prototype.id,
  UsersRelations
> {
  constructor(@inject('datasources.mysqldb') dataSource: MysqldbDataSource) {
    super(Users, dataSource);
  }
}
