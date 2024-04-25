import {inject, Getter} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Sports, SportsRelations, SportsGroups} from '../models';
import {repository, BelongsToAccessor} from '@loopback/repository';
import {SportsGroupsRepository} from './sports-groups.repository';

export class SportsRepository extends SequelizeCrudRepository<
  Sports,
  typeof Sports.prototype.id,
  SportsRelations
> {

  public readonly sportsGroup: BelongsToAccessor<SportsGroups, typeof Sports.prototype.id>;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource, @repository.getter('SportsGroupsRepository') protected sportsGroupsRepositoryGetter: Getter<SportsGroupsRepository>,
  ) {
    super(Sports, dataSource);
    this.sportsGroup = this.createBelongsToAccessorFor('sportsGroup', sportsGroupsRepositoryGetter,);
    this.registerInclusionResolver('sportsGroup', this.sportsGroup.inclusionResolver);
  }
}
