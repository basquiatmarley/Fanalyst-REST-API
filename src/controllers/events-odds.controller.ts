import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Events,
  Odds,
} from '../models';
import {EventsRepository} from '../repositories';

export class EventsOddsController {
  constructor(
    @repository(EventsRepository) protected eventsRepository: EventsRepository,
  ) { }

  @get('/events/{id}/odds', {
    responses: {
      '200': {
        description: 'Array of Events has many Odds',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Odds)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Odds>,
  ): Promise<Odds[]> {
    return this.eventsRepository.odds(id).find(filter);
  }

  @post('/events/{id}/odds', {
    responses: {
      '200': {
        description: 'Events model instance',
        content: {'application/json': {schema: getModelSchemaRef(Odds)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Events.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Odds, {
            title: 'NewOddsInEvents',
            exclude: ['id'],
            optional: ['eventId']
          }),
        },
      },
    }) odds: Omit<Odds, 'id'>,
  ): Promise<Odds> {
    return this.eventsRepository.odds(id).create(odds);
  }

  @patch('/events/{id}/odds', {
    responses: {
      '200': {
        description: 'Events.Odds PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Odds, {partial: true}),
        },
      },
    })
    odds: Partial<Odds>,
    @param.query.object('where', getWhereSchemaFor(Odds)) where?: Where<Odds>,
  ): Promise<Count> {
    return this.eventsRepository.odds(id).patch(odds, where);
  }

  @del('/events/{id}/odds', {
    responses: {
      '200': {
        description: 'Events.Odds DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Odds)) where?: Where<Odds>,
  ): Promise<Count> {
    return this.eventsRepository.odds(id).delete(where);
  }
}
