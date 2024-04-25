import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {UsersComments} from '../models';
import {UsersCommentsRepository} from '../repositories';

export class UsersCommentsController {
  constructor(
    @repository(UsersCommentsRepository)
    public usersCommentsRepository : UsersCommentsRepository,
  ) {}

  @post('/users-comments')
  @response(200, {
    description: 'UsersComments model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersComments)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersComments, {
            title: 'NewUsersComments',
            exclude: ['id'],
          }),
        },
      },
    })
    usersComments: Omit<UsersComments, 'id'>,
  ): Promise<UsersComments> {
    return this.usersCommentsRepository.create(usersComments);
  }

  @get('/users-comments/count')
  @response(200, {
    description: 'UsersComments model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UsersComments) where?: Where<UsersComments>,
  ): Promise<Count> {
    return this.usersCommentsRepository.count(where);
  }

  @get('/users-comments')
  @response(200, {
    description: 'Array of UsersComments model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UsersComments, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UsersComments) filter?: Filter<UsersComments>,
  ): Promise<UsersComments[]> {
    return this.usersCommentsRepository.find(filter);
  }

  @patch('/users-comments')
  @response(200, {
    description: 'UsersComments PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersComments, {partial: true}),
        },
      },
    })
    usersComments: UsersComments,
    @param.where(UsersComments) where?: Where<UsersComments>,
  ): Promise<Count> {
    return this.usersCommentsRepository.updateAll(usersComments, where);
  }

  @get('/users-comments/{id}')
  @response(200, {
    description: 'UsersComments model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UsersComments, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UsersComments, {exclude: 'where'}) filter?: FilterExcludingWhere<UsersComments>
  ): Promise<UsersComments> {
    return this.usersCommentsRepository.findById(id, filter);
  }

  @patch('/users-comments/{id}')
  @response(204, {
    description: 'UsersComments PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersComments, {partial: true}),
        },
      },
    })
    usersComments: UsersComments,
  ): Promise<void> {
    await this.usersCommentsRepository.updateById(id, usersComments);
  }

  @put('/users-comments/{id}')
  @response(204, {
    description: 'UsersComments PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() usersComments: UsersComments,
  ): Promise<void> {
    await this.usersCommentsRepository.replaceById(id, usersComments);
  }

  @del('/users-comments/{id}')
  @response(204, {
    description: 'UsersComments DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.usersCommentsRepository.deleteById(id);
  }
}
