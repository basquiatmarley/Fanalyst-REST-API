import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {PoolingRequests, PoolingRequestsRelations} from '../models';

export class PoolingRequestsRepository extends SequelizeCrudRepository<
  PoolingRequests,
  typeof PoolingRequests.prototype.id,
  PoolingRequestsRelations
> {
  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
  ) {
    super(PoolingRequests, dataSource);
  }
}
