import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {
  Events,
  Users,
  UsersPredictionsSummaries,
  UsersPredictionsSummariesRelations,
} from '../models';
import {UsersRepository} from './users.repository';

export class UsersPredictionsSummariesRepository extends SequelizeCrudRepository<
  UsersPredictionsSummaries,
  typeof UsersPredictionsSummaries.prototype.id,
  UsersPredictionsSummariesRelations
> {
  public readonly event: BelongsToAccessor<
    Events,
    typeof UsersPredictionsSummaries.prototype.id
  >;

  public readonly user: BelongsToAccessor<
    Users,
    typeof UsersPredictionsSummaries.prototype.id
  >;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
    @repository.getter('UsersRepository')
    protected usersRepositoryGetter: Getter<UsersRepository>,
  ) {
    super(UsersPredictionsSummaries, dataSource);
    this.user = this.createBelongsToAccessorFor('user', usersRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
  async executeCustomQuery(query: string, params?: any[]): Promise<any> {
    // `execute` runs raw SQL queries against the data source
    return this.dataSource.execute(query, params || []);
  }
}
