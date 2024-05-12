import {inject, Getter} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {SportsGroups, SportsGroupsRelations, Sports} from '../models';
import {repository, HasManyRepositoryFactory} from '@loopback/repository';
import {SportsRepository} from './sports.repository';

export class SportsGroupsRepository extends SequelizeCrudRepository<
  SportsGroups,
  typeof SportsGroups.prototype.id,
  SportsGroupsRelations
> {
  public readonly sports: HasManyRepositoryFactory<
    Sports,
    typeof SportsGroups.prototype.id
  >;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
    @repository.getter('SportsRepository')
    protected sportsRepositoryGetter: Getter<SportsRepository>,
  ) {
    super(SportsGroups, dataSource);
    this.sports = this.createHasManyRepositoryFactoryFor(
      'sports',
      sportsRepositoryGetter,
    );
    this.registerInclusionResolver('sports', this.sports.inclusionResolver);
  }
}
