import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'scores',
})
export class Scores extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true, // Auto-incremented primary key
  })
  id: number;

  @property({
    type: 'string',
  })
  eventId: string;

  @property({
    type: 'number',
  })
  completed: number; // Indicates if the score is finalized

  @property({
    type: 'number',
  })
  homeScore: number;

  @property({
    type: 'number',
  })
  awayScore: number;

  @property({
    type: 'date', // Timestamp for record creation
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
  })
  statusDeleted: number;

  constructor(data?: Partial<Scores>) {
    super(data); // Initialize the model with the given data
  }
}

export interface ScoresRelations {
  // describe navigational properties here
}

export type ScoresWithRelations = Scores & ScoresRelations;
