import {inject, Getter} from '@loopback/core';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {UsersPredictions, UsersPredictionsRelations, Events} from '../models';
import {repository, BelongsToAccessor} from '@loopback/repository';
import {EventsRepository} from './events.repository';

export class UsersPredictionsRepository extends SequelizeCrudRepository<
  UsersPredictions,
  typeof UsersPredictions.prototype.id,
  UsersPredictionsRelations
> {

  public readonly event: BelongsToAccessor<Events, typeof UsersPredictions.prototype.id>;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource, @repository.getter('EventsRepository') protected eventsRepositoryGetter: Getter<EventsRepository>,
  ) {
    super(UsersPredictions, dataSource);
    this.event = this.createBelongsToAccessorFor('event', eventsRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
  }
}
