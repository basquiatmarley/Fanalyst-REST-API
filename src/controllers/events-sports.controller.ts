import {authenticate} from '@loopback/authentication';
import {
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
} from '@loopback/rest';
import {
  Events,
  Sports,
} from '../models';
import {EventsRepository} from '../repositories';

@authenticate('jwt')
export class EventsSportsController {
  constructor(
    @repository(EventsRepository)
    public eventsRepository: EventsRepository,
  ) { }

  @get('/events/{id}/sports', {
    responses: {
      '200': {
        description: 'Sports belonging to Events',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Sports),
          },
        },
      },
    },
  })
  async getSports(
    @param.path.string('id') id: typeof Events.prototype.id,
  ): Promise<Sports> {
    return this.eventsRepository.sport(id);
  }
}
