import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users_comments',
})
export class UsersComments extends Entity {

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
  parentId?: number;

  @property({
    type: 'string', // Status of the comment
  })
  title: string;

  @property({
    type: 'string', // Status of the comment
  })
  description: string;

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
    type: 'number', // Default status for soft deletion

  })
  statusDeleted: number;

  @property({
    type: 'number', // Left position for nested comments

  })
  lft?: number;

  @property({
    type: 'number',
  })
  rght?: number;



  constructor(data?: Partial<UsersComments>) {
    super(data); // Initialize the model with the given data
  }
}

export interface UsersCommentsRelations {
  // describe navigational properties here
}

export type UsersCommentsWithRelations = UsersComments & UsersCommentsRelations;
