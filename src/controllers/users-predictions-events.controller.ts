import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UsersPredictions,
  Events,
} from '../models';
import {UsersPredictionsRepository} from '../repositories';

export class UsersPredictionsEventsController {
  constructor(
    @repository(UsersPredictionsRepository)
    public usersPredictionsRepository: UsersPredictionsRepository,
  ) { }

  @get('/users-predictions/{id}/events', {
    responses: {
      '200': {
        description: 'Events belonging to UsersPredictions',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Events),
          },
        },
      },
    },
  })
  async getEvents(
    @param.path.number('id') id: typeof UsersPredictions.prototype.id,
  ): Promise<Events> {
    return this.usersPredictionsRepository.event(id);
  }
}
