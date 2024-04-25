import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users',
  settings: {strict: true}
})
export class Users extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true, // Auto-incremented primary key
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 20, // Role varchar(20)
    },
  })
  role: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 50, // First name varchar(50)
    },
  })
  firstName: string;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      maxLength: 50, // Last name varchar(50)
    },
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
    index: true, // Adding index for faster lookups
    jsonSchema: {
      format: 'email', // Ensures valid email format
    },
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string; // Note: Passwords should be securely hashed

  @property({
    type: 'string',
  })
  imageUrl?: string; // Optional profile image URL

  @property({
    type: 'number',
    jsonSchema: {
      minimum: 0,
      maximum: 2, // Ensures status is a 2-digit integer
    },
  })
  status?: number;

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

  constructor(data?: Partial<Users>) {
    super(data);
  }

}

export interface UsersRelations {
  // describe navigational properties here
}

export type UsersWithRelations = Users & UsersRelations;
