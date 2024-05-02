import {Entity, belongsTo, model, property} from '@loopback/repository';
import {Events} from './events.model';

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

  @belongsTo(() => Events)
  eventId: string;

  constructor(data?: Partial<UsersPredictions>) {
    super(data); // Initialize the model with the given data
  }

}

export interface UsersPredictionsRelations {
  event: Events
}

export type UsersPredictionsWithRelations = UsersPredictions & UsersPredictionsRelations;
