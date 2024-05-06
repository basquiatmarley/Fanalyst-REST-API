import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {UsersNotifications, UsersNotificationsRelations} from '../models';

export class UsersNotificationsRepository extends SequelizeCrudRepository<
  UsersNotifications,
  typeof UsersNotifications.prototype.id,
  UsersNotificationsRelations
> {
  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
  ) {
    super(UsersNotifications, dataSource);
  }
}
