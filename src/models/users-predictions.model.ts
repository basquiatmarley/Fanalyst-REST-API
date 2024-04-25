import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users_predictions',
})
export class UsersPredictions extends Entity {

  @property({
    type: 'number',
    id: true,
    generated: true, // Auto-incremented primary key
  })
  id: number;

  @property({
    type: 'string', // Event ID is a foreign key

  })
  eventId: string;

  @property({
    type: 'number',
  })
  predictedTeam: number;

  @property({
    type: 'number', // Status of the prediction

  })
  predictedStatus: number;

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
    type: 'number', // Status indicating if the record is deleted

  })
  statusDeleted: number;



  constructor(data?: Partial<UsersPredictions>) {
    super(data); // Initialize the model with the given data
  }

}

export interface UsersPredictionsRelations {
  // describe navigational properties here
}

export type UsersPredictionsWithRelations = UsersPredictions & UsersPredictionsRelations;
