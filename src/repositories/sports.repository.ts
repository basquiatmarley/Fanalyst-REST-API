import {inject, Getter} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {Sports, SportsRelations, SportsGroups, Events} from '../models';
import {
  repository,
  BelongsToAccessor,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {SportsGroupsRepository} from './sports-groups.repository';
import {EventsRepository} from './events.repository';

export class SportsRepository extends SequelizeCrudRepository<
  Sports,
  typeof Sports.prototype.id,
  SportsRelations
> {
  public readonly sportsGroup: BelongsToAccessor<
    SportsGroups,
    typeof Sports.prototype.id
  >;

  public readonly events: HasManyRepositoryFactory<
    Events,
    typeof Sports.prototype.id
  >;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
    @repository.getter('SportsGroupsRepository')
    protected sportsGroupsRepositoryGetter: Getter<SportsGroupsRepository>,
    @repository.getter('EventsRepository')
    protected eventsRepositoryGetter: Getter<EventsRepository>,
  ) {
    super(Sports, dataSource);
    this.events = this.createHasManyRepositoryFactoryFor(
      'events',
      eventsRepositoryGetter,
    );
    this.registerInclusionResolver('events', this.events.inclusionResolver);
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
