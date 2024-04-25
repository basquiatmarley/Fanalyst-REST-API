import {Entity, belongsTo, model, property} from '@loopback/repository';
import {SportsGroups} from './sports-groups.model';

@model({
  name: 'clubs',
})
export class Clubs extends Entity {

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
  })
  status: number; // Mapped to MySQL column with underscore

  @property({
    type: 'string',
  })
  imageUrl?: string; // Using camel case in the model

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
    default: 0, // Default value for the field
  })
  statusDeleted: number;

  @belongsTo(() => SportsGroups)
  sportsGroupId: number;

  constructor(data?: Partial<Clubs>) {
    super(data); // Initialize the model with given data
  }

}

export interface ClubsRelations {
  // describe navigational properties here
  sportsGroup?: ClubsWithRelations
}

export type ClubsWithRelations = Clubs & ClubsRelations;
