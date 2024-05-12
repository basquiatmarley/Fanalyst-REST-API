import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Events, UsersPredictions} from '../models';
import {UsersPredictionsRepository} from '../repositories';

@authenticate('jwt')
export class UsersPredictionsEventsController {
  constructor(
    @repository(UsersPredictionsRepository)
    public usersPredictionsRepository: UsersPredictionsRepository,
  ) {}

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
