import {
  Entity,
  belongsTo,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {Clubs} from './clubs.model';
import {Odds} from './odds.model';
import {Scores} from './scores.model';
import {SportsGroups} from './sports-groups.model';
import {Sports} from './sports.model';
import {UsersComments} from './users-comments.model';
import {UsersPredictions} from './users-predictions.model';

@model({
  name: 'events',
})
export class Events extends Entity {
  @property({
    type: 'string',
    id: true, // Primary key
  })
  id: string; // Unique identifier
  @property({
    type: 'date',
  })
  commenceTime: Date; // Event start time

  @property({
    type: 'number',
  })
  winner?: number; // Indicates which team won the event

  @property({
    type: 'number',
  })
  completed: number; // Indicates if the event is completed

  @property({
    type: 'number',
  })
  status: number; // Status of the event

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: string;

  @property({
    type: 'number',
  })
  createdBy?: number;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  @property({
    type: 'number',
  })
  updatedBy?: number;

  @property({
    type: 'number',
    default: 0,
  })
  statusDeleted: number;

  @belongsTo(() => SportsGroups)
  sportsGroupId: number;

  @belongsTo(() => Sports)
  sportId: number;

  @belongsTo(() => Clubs, {
    name: 'homeClub',
    keyFrom: 'homeClubId',
    keyTo: 'id',
  })
  homeClubId: number;

  @belongsTo(() => Clubs, {
    name: 'awayClub',
    keyFrom: 'awayClubId',
    keyTo: 'id',
  })
  awayClubId: number;

  @hasMany(() => Scores, {keyTo: 'eventId'})
  scores: Scores[];

  @hasMany(() => UsersComments, {keyTo: 'eventId'})
  usersComments: UsersComments[];

  @hasMany(() => UsersPredictions, {keyTo: 'eventId'})
  usersPredictions: UsersPredictions[];

  @hasMany(() => Odds, {keyTo: 'eventId'})
  odds: Odds[];

  constructor(data?: Partial<Events>) {
    super(data); // Initialize the model with given data
  }
}

export interface EventsRelations {
  sport: Sports;
  sportsGroup: SportsGroups;
  homeClub: Clubs;
  awayClub: Clubs;
}

export type EventsWithRelations = Events & EventsRelations;
