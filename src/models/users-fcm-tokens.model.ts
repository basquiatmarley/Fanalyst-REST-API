import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users_fcm_tokens',
  settings: {
    strict: false, // allow additional properties
  },
})
export class UsersFcmTokens extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  userId: number;

  @property({
    type: 'string', // token is text, using string in LoopBack
  })
  token: string;

  @property({
    type: 'number',
    default: 1,
  })
  status: number;

  @property({
    type: 'date',
    default: () => new Date(), // create timestamp
  })
  createdAt?: Date;

  @property({
    type: 'date',
    default: () => new Date(), // updated timestamp
  })
  updatedAt?: Date;

  constructor(data?: Partial<UsersFcmTokens>) {
    super(data);
  }

}

export interface UsersFcmTokensRelations {
  // describe navigational properties here
}

export type UsersFcmTokensWithRelations = UsersFcmTokens & UsersFcmTokensRelations;
