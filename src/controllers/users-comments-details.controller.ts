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
import {UsersComments} from '../models';
import {UsersCommentsRepository} from '../repositories';

@authenticate('jwt')
export class UsersCommentsUsersCommentsController {
  constructor(
    @repository(UsersCommentsRepository)
    protected usersCommentsRepository: UsersCommentsRepository,
  ) {}

  @get('/users-comments/{id}/details', {
    responses: {
      '200': {
        description: 'Array of UsersComments has many UsersComments',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UsersComments)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UsersComments>,
  ): Promise<UsersComments[]> {
    return this.usersCommentsRepository.usersCommentsDetails(id).find(filter);
  }

  @post('/users-comments/{id}/details', {
    responses: {
      '200': {
        description: 'UsersComments model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(UsersComments)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof UsersComments.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersComments, {
            title: 'NewUsersCommentsInUsersComments',
            exclude: ['id'],
            optional: ['parentId'],
          }),
        },
      },
    })
    usersComments: Omit<UsersComments, 'id'>,
  ): Promise<UsersComments> {
    return this.usersCommentsRepository
      .usersCommentsDetails(id)
      .create(usersComments);
  }

  @patch('/users-comments/{id}/details', {
    responses: {
      '200': {
        description: 'UsersComments.UsersComments PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersComments, {partial: true}),
        },
      },
    })
    usersComments: Partial<UsersComments>,
    @param.query.object('where', getWhereSchemaFor(UsersComments))
    where?: Where<UsersComments>,
  ): Promise<Count> {
    return this.usersCommentsRepository
      .usersCommentsDetails(id)
      .patch(usersComments, where);
  }

  @del('/users-comments/{id}/details', {
    responses: {
      '200': {
        description: 'UsersComments.UsersComments DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UsersComments))
    where?: Where<UsersComments>,
  ): Promise<Count> {
    return this.usersCommentsRepository.usersCommentsDetails(id).delete(where);
  }
}
