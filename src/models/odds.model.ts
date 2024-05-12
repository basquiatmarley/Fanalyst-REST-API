import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'odds',
})
export class Odds extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true, // Auto-incremented primary key
  })
  id: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'eventId',
    },
  })
  eventId: string;

  @property({
    type: 'string',
  })
  bookmakerKey: string;

  @property({
    type: 'string',
  })
  bookmakerTitle: string;

  @property({
    type: 'string',
  })
  marketsKey: string;

  @property({
    type: 'number',
  })
  oddsHomePoint: number;

  @property({
    type: 'number',
  })
  oddsAwayPoint: number;

  @property({
    type: 'number',
  })
  oddsHomePrice: number;

  @property({
    type: 'number',
  })
  oddsAwayPrice: number;

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

  constructor(data?: Partial<Odds>) {
    super(data); // Initialize the model with the given data
  }
}

export interface OddsRelations {
  // describe navigational properties here
}

export type OddsWithRelations = Odds & OddsRelations;
