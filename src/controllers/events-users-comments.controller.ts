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
  UsersComments,
} from '../models';
import {EventsRepository} from '../repositories';

export class EventsUsersCommentsController {
  constructor(
    @repository(EventsRepository) protected eventsRepository: EventsRepository,
  ) { }

  @get('/events/{id}/users-comments', {
    responses: {
      '200': {
        description: 'Array of Events has many UsersComments',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UsersComments)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<UsersComments>,
  ): Promise<UsersComments[]> {
    return this.eventsRepository.usersComments(id).find(filter);
  }

  @post('/events/{id}/users-comments', {
    responses: {
      '200': {
        description: 'Events model instance',
        content: {'application/json': {schema: getModelSchemaRef(UsersComments)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Events.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersComments, {
            title: 'NewUsersCommentsInEvents',
            exclude: ['id'],
            optional: ['eventId']
          }),
        },
      },
    }) usersComments: Omit<UsersComments, 'id'>,
  ): Promise<UsersComments> {
    return this.eventsRepository.usersComments(id).create(usersComments);
  }

  @patch('/events/{id}/users-comments', {
    responses: {
      '200': {
        description: 'Events.UsersComments PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersComments, {partial: true}),
        },
      },
    })
    usersComments: Partial<UsersComments>,
    @param.query.object('where', getWhereSchemaFor(UsersComments)) where?: Where<UsersComments>,
  ): Promise<Count> {
    return this.eventsRepository.usersComments(id).patch(usersComments, where);
  }

  @del('/events/{id}/users-comments', {
    responses: {
      '200': {
        description: 'Events.UsersComments DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(UsersComments)) where?: Where<UsersComments>,
  ): Promise<Count> {
    return this.eventsRepository.usersComments(id).delete(where);
  }
}
