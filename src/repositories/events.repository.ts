import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {SequelizeCrudRepository} from '@loopback/sequelize';
import {MysqldbDataSource} from '../datasources';
import {
  Clubs,
  Events,
  EventsRelations,
  Scores,
  Sports,
  SportsGroups,
  UsersComments,
  UsersPredictions,
  Odds,
} from '../models';
import {ClubsRepository} from './clubs.repository';
import {OddsRepository} from './odds.repository';
import {ScoresRepository} from './scores.repository';
import {SportsGroupsRepository} from './sports-groups.repository';
import {SportsRepository} from './sports.repository';
import {UsersCommentsRepository} from './users-comments.repository';
import {UsersPredictionsRepository} from './users-predictions.repository';

export class EventsRepository extends SequelizeCrudRepository<
  Events,
  typeof Events.prototype.id,
  EventsRelations
> {
  public readonly sportsGroup: BelongsToAccessor<
    SportsGroups,
    typeof Events.prototype.id
  >;

  public readonly sport: BelongsToAccessor<Sports, typeof Events.prototype.id>;

  public readonly homeClub: BelongsToAccessor<
    Clubs,
    typeof Events.prototype.id
  >;

  public readonly awayClub: BelongsToAccessor<
    Clubs,
    typeof Events.prototype.id
  >;

  public readonly scores: HasManyRepositoryFactory<
    Scores,
    typeof Events.prototype.id
  >;

  public readonly usersComments: HasManyRepositoryFactory<
    UsersComments,
    typeof Events.prototype.id
  >;

  public readonly usersPredictions: HasManyRepositoryFactory<
    UsersPredictions,
    typeof Events.prototype.id
  >;

  public readonly odds: HasManyRepositoryFactory<
    Odds,
    typeof Events.prototype.id
  >;

  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
    @repository.getter('SportsGroupsRepository')
    protected sportsGroupsRepositoryGetter: Getter<SportsGroupsRepository>,
    @repository.getter('SportsRepository')
    protected sportsRepositoryGetter: Getter<SportsRepository>,
    @repository.getter('ClubsRepository')
    protected clubsRepositoryGetter: Getter<ClubsRepository>,
    @repository.getter('OddsRepository')
    protected oddsRepositoryGetter: Getter<OddsRepository>,
    @repository.getter('ScoresRepository')
    protected scoresRepositoryGetter: Getter<ScoresRepository>,
    @repository.getter('UsersCommentsRepository')
    protected usersCommentsRepositoryGetter: Getter<UsersCommentsRepository>,
    @repository.getter('UsersPredictionsRepository')
    protected usersPredictionsRepositoryGetter: Getter<UsersPredictionsRepository>,
  ) {
    super(Events, dataSource);
    this.odds = this.createHasManyRepositoryFactoryFor(
      'odds',
      oddsRepositoryGetter,
    );
    this.registerInclusionResolver('odds', this.odds.inclusionResolver);
    this.usersPredictions = this.createHasManyRepositoryFactoryFor(
      'usersPredictions',
      usersPredictionsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'usersPredictions',
      this.usersPredictions.inclusionResolver,
    );
    this.usersComments = this.createHasManyRepositoryFactoryFor(
      'usersComments',
      usersCommentsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'usersComments',
      this.usersComments.inclusionResolver,
    );
    this.scores = this.createHasManyRepositoryFactoryFor(
      'scores',
      scoresRepositoryGetter,
    );
    this.registerInclusionResolver('scores', this.scores.inclusionResolver);
    this.awayClub = this.createBelongsToAccessorFor(
      'awayClub',
      clubsRepositoryGetter,
    );
    this.registerInclusionResolver('awayClub', this.awayClub.inclusionResolver);
    this.homeClub = this.createBelongsToAccessorFor(
      'homeClub',
      clubsRepositoryGetter,
    );
    this.registerInclusionResolver('homeClub', this.homeClub.inclusionResolver);
    this.sport = this.createBelongsToAccessorFor(
      'sport',
      sportsRepositoryGetter,
    );
    this.registerInclusionResolver('sport', this.sport.inclusionResolver);
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
