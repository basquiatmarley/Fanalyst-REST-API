import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Events, Users, UsersPredictionsSummariesAts, UsersPredictionsSummariesAtsRelations} from '../models';
import {UsersRepository} from './users.repository';

export class UsersPredictionsSummariesAtsRepository extends SequelizeCrudRepository<
  UsersPredictionsSummariesAts,
  typeof UsersPredictionsSummariesAts.prototype.id,
  UsersPredictionsSummariesAtsRelations
> {

  public readonly event: BelongsToAccessor<Events, typeof UsersPredictionsSummariesAts.prototype.id>;

  public readonly user: BelongsToAccessor<Users, typeof UsersPredictionsSummariesAts.prototype.id>;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource, @repository.getter('UsersRepository') protected usersRepositoryGetter: Getter<UsersRepository>,
  ) {
    super(UsersPredictionsSummariesAts, dataSource);
    this.user = this.createBelongsToAccessorFor('user', usersRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
