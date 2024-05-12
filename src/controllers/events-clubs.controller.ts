import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Clubs, Events} from '../models';
import {EventsRepository} from '../repositories';

@authenticate('jwt')
export class EventsClubsController {
  constructor(
    @repository(EventsRepository)
    public eventsRepository: EventsRepository,
  ) {}

  @get('/events/{id}/clubs-away', {
    responses: {
      '200': {
        description: 'Clubs Away belonging to Events',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Clubs),
          },
        },
      },
    },
  })
  async getClubsAway(
    @param.path.string('id') id: typeof Events.prototype.id,
  ): Promise<Clubs> {
    return this.eventsRepository.awayClub(id);
  }
  @get('/events/{id}/clubs-home', {
    responses: {
      '200': {
        description: 'Clubs Home belonging to Events',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Clubs),
          },
        },
      },
    },
  })
  async getClubsHome(
    @param.path.string('id') id: typeof Events.prototype.id,
  ): Promise<Clubs> {
    return this.eventsRepository.homeClub(id);
  }
}
