import {authenticate} from '@loopback/authentication';
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
  UsersPredictions,
} from '../models';
import {EventsRepository} from '../repositories';

@authenticate('jwt')
export class EventsUsersPredictionsController {
  constructor(
    @repository(EventsRepository) protected eventsRepository: EventsRepository,
  ) { }

  @get('/events/{id}/users-predictions', {
    responses: {
      '200': {
        description: 'Array of Events has many UsersPredictions',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UsersPredictions)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<UsersPredictions>,
  ): Promise<UsersPredictions[]> {
    return this.eventsRepository.usersPredictions(id).find(filter);
  }

  @post('/events/{id}/users-predictions', {
    responses: {
      '200': {
        description: 'Events model instance',
        content: {'application/json': {schema: getModelSchemaRef(UsersPredictions)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Events.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictions, {
            title: 'NewUsersPredictionsInEvents',
            exclude: ['id'],
            optional: ['eventId']
          }),
        },
      },
    }) usersPredictions: Omit<UsersPredictions, 'id'>,
  ): Promise<UsersPredictions> {
    return this.eventsRepository.usersPredictions(id).create(usersPredictions);
  }

  @patch('/events/{id}/users-predictions', {
    responses: {
      '200': {
        description: 'Events.UsersPredictions PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictions, {partial: true}),
        },
      },
    })
    usersPredictions: Partial<UsersPredictions>,
    @param.query.object('where', getWhereSchemaFor(UsersPredictions)) where?: Where<UsersPredictions>,
  ): Promise<Count> {
    return this.eventsRepository.usersPredictions(id).patch(usersPredictions, where);
  }

  @del('/events/{id}/users-predictions', {
    responses: {
      '200': {
        description: 'Events.UsersPredictions DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(UsersPredictions)) where?: Where<UsersPredictions>,
  ): Promise<Count> {
    return this.eventsRepository.usersPredictions(id).delete(where);
  }
}
