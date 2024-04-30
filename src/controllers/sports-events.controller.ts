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
  Sports,
  Events,
} from '../models';
import {SportsRepository} from '../repositories';

export class SportsEventsController {
  constructor(
    @repository(SportsRepository) protected sportsRepository: SportsRepository,
  ) { }

  @get('/sports/{id}/events', {
    responses: {
      '200': {
        description: 'Array of Sports has many Events',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Events)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Events>,
  ): Promise<Events[]> {
    return this.sportsRepository.events(id).find(filter);
  }

  @post('/sports/{id}/events', {
    responses: {
      '200': {
        description: 'Sports model instance',
        content: {'application/json': {schema: getModelSchemaRef(Events)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Sports.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Events, {
            title: 'NewEventsInSports',
            exclude: ['id'],
            optional: ['sportId']
          }),
        },
      },
    }) events: Omit<Events, 'id'>,
  ): Promise<Events> {
    return this.sportsRepository.events(id).create(events);
  }

  @patch('/sports/{id}/events', {
    responses: {
      '200': {
        description: 'Sports.Events PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Events, {partial: true}),
        },
      },
    })
    events: Partial<Events>,
    @param.query.object('where', getWhereSchemaFor(Events)) where?: Where<Events>,
  ): Promise<Count> {
    return this.sportsRepository.events(id).patch(events, where);
  }

  @del('/sports/{id}/events', {
    responses: {
      '200': {
        description: 'Sports.Events DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Events)) where?: Where<Events>,
  ): Promise<Count> {
    return this.sportsRepository.events(id).delete(where);
  }
}
