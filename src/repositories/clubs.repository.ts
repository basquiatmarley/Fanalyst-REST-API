import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Clubs, ClubsRelations, SportsGroups} from '../models';
import {SportsGroupsRepository} from './sports-groups.repository';

export class ClubsRepository extends SequelizeCrudRepository<
  Clubs,
  typeof Clubs.prototype.id,
  ClubsRelations
> {
  public readonly sportsGroup: BelongsToAccessor<
    SportsGroups,
    typeof Clubs.prototype.id
  >;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
    @repository.getter('SportsGroupsRepository')
    protected sportsGroupsRepositoryGetter: Getter<SportsGroupsRepository>,
  ) {
    super(Clubs, dataSource);
    this.sportsGroup = this.createBelongsToAccessorFor(
      'sportsGroup',
      sportsGroupsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'sportsGroup',
      this.sportsGroup.inclusionResolver,
    );
  }
}
