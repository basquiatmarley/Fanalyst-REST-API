import {Entity, belongsTo, model, property} from '@loopback/repository';
import {Users} from './users.model';

@model({
  name: 'users_predictions_all_times',
})
export class UsersPredictionsSummariesAts extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true, // Auto-incremented primary key
  })
  id: number;
  @property({
    type: 'number',
    default: 0,
  })
  winStreak: number; // Rentetan kemenangan terpanjang

  @property({
    type: 'number',
    default: 0,
  })
  loseStreak: number;

  @property({
    type: 'number',
    default: 0,
  })
  longestWinStreak: number; // Rentetan kemenangan terpanjang

  @property({
    type: 'number',
    default: 0,
  })
  longestLoseStreak: number;

  @property({
    type: 'number',
    default: 0,
  })
  correct: number; // Jumlah prediksi benar

  @property({
    type: 'number',
    default: 0,
  })
  incorrect: number; // Jumlah prediksi salah

  @property({
    type: 'number',
    required: true,
  })
  countPrediction: number; // Total jumlah prediksi dalam periode tertentu

  @property({
    type: 'number',
    default: 0,
  })
  statusDeleted: number;
  @property({
    type: 'number',
    default: 0,
  })
  statusWinStreak: number;

  @property({
    type: 'number',
    default: 0,
  })
  statusLoseStreak: number;

  @belongsTo(() => Users)
  userId: number;

  constructor(data?: Partial<UsersPredictionsSummariesAts>) {
    super(data); // Inisialisasi dengan data yang diberikan
  }
}

export interface UsersPredictionsSummariesAtsRelations {
  user: Users;
}

export type UsersPredictionsSummariesAtsWithRelations =
  UsersPredictionsSummariesAts & UsersPredictionsSummariesAtsRelations;
