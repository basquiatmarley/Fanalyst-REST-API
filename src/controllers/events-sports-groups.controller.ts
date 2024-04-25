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
  SportsGroups,
} from '../models';
import {EventsRepository} from '../repositories';

export class EventsSportsGroupsController {
  constructor(
    @repository(EventsRepository)
    public eventsRepository: EventsRepository,
  ) { }

  @get('/events/{id}/sports-groups', {
    responses: {
      '200': {
        description: 'SportsGroups belonging to Events',
        content: {
          'application/json': {
            schema: getModelSchemaRef(SportsGroups),
          },
        },
      },
    },
  })
  async getSportsGroups(
    @param.path.string('id') id: typeof Events.prototype.id,
  ): Promise<SportsGroups> {
    return this.eventsRepository.sportsGroup(id);
  }
}
