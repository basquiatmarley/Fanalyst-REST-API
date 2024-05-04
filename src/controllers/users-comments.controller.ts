import {authenticate, TokenService} from '@loopback/authentication';
import {
  UserRepository as JWTUserRepository,
  TokenServiceBindings
} from '@loopback/authentication-jwt';

import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {UsersComments} from '../models';
import {UsersCommentsRepository} from '../repositories';

export class UsersCommentsController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(JWTUserRepository) protected jwtUserRepository: JWTUserRepository,
    @repository(UsersCommentsRepository)
    public usersCommentsRepository: UsersCommentsRepository,
  ) { }

  @authenticate('jwt')
  @post('/users-comments')
  @response(200, {
    description: 'UsersComments model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersComments)}},
  })
  async create(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
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
    const uId: number = Number(currentUserProfile[securityId]);
    usersComments.createdBy = uId;
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
