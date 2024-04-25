import {Entity, model, property, belongsTo} from '@loopback/repository';
import {SportsGroups} from './sports-groups.model';

@model()
export class Sports extends Entity {

  @property({
    type: 'number',
    id: true,
    generated: true, // Auto-incremented primary key
  })
  id: number; // No need for a custom mapping for ID
  @property({
    type: 'string', // Unique key for the sport
    required: true,
    unique: true,
  })
  key: string;

  @property({
    type: 'string', // Title of the sport

  })
  title: string;

  @property({
    type: 'number', // Status of the sport

  })
  status: number;

  @property({
    type: 'string', // Image URL for the sport

  })
  imageUrl?: string;

  @property({
    type: 'date', // Timestamp for record creation
    default: () => new Date(),
  })
  createdAt?: string;

  @property({
    type: 'number', // ID of the person who created the record

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
    type: 'number', // Status for soft deletion
    default: 0, // Default value

  })
  statusDeleted: number;

  @belongsTo(() => SportsGroups)
  sportsGroupId: number;

  constructor(data?: Partial<Sports>) {
    super(data); // Initialize the model with given data
  }
}

export interface SportsRelations {
  // describe navigational properties here
}

export type SportsWithRelations = Sports & SportsRelations;
