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
  Scores,
} from '../models';
import {EventsRepository} from '../repositories';

export class EventsScoresController {
  constructor(
    @repository(EventsRepository) protected eventsRepository: EventsRepository,
  ) { }

  @get('/events/{id}/scores', {
    responses: {
      '200': {
        description: 'Array of Events has many Scores',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Scores)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Scores>,
  ): Promise<Scores[]> {
    return this.eventsRepository.scores(id).find(filter);
  }

  @post('/events/{id}/scores', {
    responses: {
      '200': {
        description: 'Events model instance',
        content: {'application/json': {schema: getModelSchemaRef(Scores)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Events.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scores, {
            title: 'NewScoresInEvents',
            exclude: ['id'],
            optional: ['eventId']
          }),
        },
      },
    }) scores: Omit<Scores, 'id'>,
  ): Promise<Scores> {
    return this.eventsRepository.scores(id).create(scores);
  }

  @patch('/events/{id}/scores', {
    responses: {
      '200': {
        description: 'Events.Scores PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scores, {partial: true}),
        },
      },
    })
    scores: Partial<Scores>,
    @param.query.object('where', getWhereSchemaFor(Scores)) where?: Where<Scores>,
  ): Promise<Count> {
    return this.eventsRepository.scores(id).patch(scores, where);
  }

  @del('/events/{id}/scores', {
    responses: {
      '200': {
        description: 'Events.Scores DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Scores)) where?: Where<Scores>,
  ): Promise<Count> {
    return this.eventsRepository.scores(id).delete(where);
  }
}
