import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'pooling_requests',
  settings: {strict: false},
})
export class PoolingRequests extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true, // Auto-incremented primary key
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  type: string; // Type of request (assuming various request types)

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 255, // Maximum URL length
    },
  })
  urlRequest: string; // URL of the request

  @property({
    type: 'string',
    required: true,
  })
  request: string; // Original request text (if applicable)

  @property({
    type: 'string',
  })
  response?: string; // Response text (if applicable, might be null)

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: string;

  @property({
    type: 'number',
  })
  createdBy?: number; // ID of the creator, can be null

  @property({
    type: 'date',
  })
  updatedAt?: string; // Last update timestamp

  @property({
    type: 'number',
  })
  updatedBy?: number;
  // ID of the person who updated, can be null

  @property({
    type: 'number',
    jsonSchema: {
      minimum: 0,
      maximum: 2,
    },
    default: 0, // Default to not deleted
  })
  statusDeleted: number;

  constructor(data?: Partial<PoolingRequests>) {
    super(data);
  }
}

export interface PoolingRequestsRelations {
  // describe navigational properties here
}

export type PoolingRequestsWithRelations = PoolingRequests & PoolingRequestsRelations;
