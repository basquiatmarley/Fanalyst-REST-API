import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Users, UsersComments, UsersCommentsRelations} from '../models';
import {UsersRepository} from './users.repository';

export class UsersCommentsRepository extends SequelizeCrudRepository<
  UsersComments,
  typeof UsersComments.prototype.id,
  UsersCommentsRelations
> {
  public readonly userCreated: BelongsToAccessor<
    Users,
    typeof UsersComments.prototype.id
  >;

  public readonly usersCommentsDetails: HasManyRepositoryFactory<
    UsersComments,
    typeof UsersComments.prototype.id
  >;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
    @repository.getter('UsersRepository')
    protected usersRepositoryGetter: Getter<UsersRepository>,
    @repository.getter('UsersCommentsRepository')
    protected usersCommentsRepositoryGetter: Getter<UsersCommentsRepository>,
  ) {
    super(UsersComments, dataSource);
    this.usersCommentsDetails = this.createHasManyRepositoryFactoryFor(
      'usersCommentsDetails',
      usersCommentsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'usersCommentsDetails',
      this.usersCommentsDetails.inclusionResolver,
    );
    this.userCreated = this.createBelongsToAccessorFor(
      'userCreated',
      usersRepositoryGetter,
    );
    this.registerInclusionResolver(
      'userCreated',
      this.userCreated.inclusionResolver,
    );
  }
}
