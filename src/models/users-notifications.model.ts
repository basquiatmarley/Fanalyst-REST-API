import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users_notifications'
})
export class UsersNotifications extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  userId: number;

  @property({
    type: 'number',
    default: 0,
  })
  ntype: number;

  @property({
    type: 'number',
    required: true,
  })
  refKey: number;

  @property({
    type: 'string',
    nullable: true,
  })
  message?: string;

  @property({
    type: 'number',
    default: 0,
  })
  status: number;

  @property({
    type: 'number',
    default: 0,
  })
  statusDeleted: number;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt: string;

  @property({
    type: 'date',
    nullable: true,
  })
  updatedAt?: string;
}

export interface UsersNotificationsRelations {
  // describe navigational properties here
}

export type UsersNotificationsWithRelations = UsersNotifications & UsersNotificationsRelations;
