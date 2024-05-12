import {Entity, model, property, hasMany} from '@loopback/repository';
import {Sports} from './sports.model';

@model({
  name: 'sports_groups',
  settings: {strict: false},
})
export class SportsGroups extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true, // Auto-incremented primary key
  })
  id: number; // Generally, no additional mapping is needed for auto-incremented primary keys

  @property({
    type: 'string',
  })
  title: string;

  @property({
    type: 'number',
    default: 0,
  })
  statusHotest: number; // Using camel case in the model

  @property({
    type: 'number',
  })
  status: number;

  @property({
    type: 'string', // Optional field for image URL
  })
  imageUrl?: string;

  @property({
    type: 'string', // Image URL for the sport
  })
  backgroundUrl?: string;

  @property({
    type: 'date', // Timestamp for record creation
    default: () => new Date(),
  })
  createdAt?: string;

  @property({
    type: 'number', // ID of the person who created the record
  })
  createdBy?: number; // Optional field for creator's ID

  @property({
    type: 'date',
  })
  updatedAt?: string;

  @property({
    type: 'number',
  })
  updatedBy?: number; // Optional field for updater's ID

  @property({
    type: 'number',
    default: 0,
  })
  statusDeleted: number;

  @hasMany(() => Sports, {keyTo: 'sportsGroupId'})
  sports: Sports[];

  constructor(data?: Partial<SportsGroups>) {
    super(data); // Initialize the model with the given data
  }
}

export interface SportsGroupsRelations {
  // describe navigational properties here
}

export type SportsGroupsWithRelations = SportsGroups & SportsGroupsRelations;
