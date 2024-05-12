import {TokenService, authenticate} from '@loopback/authentication';
import {
  UserRepository as JWTUserRepository,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  Where,
  repository,
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
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {UsersFcmTokens} from '../models';
import {UsersFcmTokensRepository} from '../repositories';

@authenticate('jwt')
export class UsersFcmTokensController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(JWTUserRepository)
    protected jwtUserRepository: JWTUserRepository,
    @repository(UsersFcmTokensRepository)
    public usersFcmTokensRepository: UsersFcmTokensRepository,
  ) {}

  @authenticate('jwt')
  @post('/users-fcm-tokens')
  @response(200, {
    description: 'UsersFcmTokens model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersFcmTokens)}},
  })
  async create(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersFcmTokens, {
            title: 'NewUsersFcmTokens',
            exclude: ['id', 'userId'],
          }),
        },
      },
    })
    usersFcmTokens: Omit<UsersFcmTokens, 'id'>,
  ): Promise<UsersFcmTokens> {
    const uId: number = Number(currentUserProfile[securityId]);
    usersFcmTokens.userId = uId;
    const findOne = await this.usersFcmTokensRepository.findOne({
      where: {
        and: [{userId: uId}, {token: usersFcmTokens.token}],
      },
    });
    var usersFcmTokensSaved: UsersFcmTokens;
    if (!findOne) {
      usersFcmTokensSaved =
        await this.usersFcmTokensRepository.create(usersFcmTokens);
    } else {
      var date = new Date();
      await this.usersFcmTokensRepository.updateById(findOne.id, {
        updatedAt: date,
      });
      findOne.updatedAt = date;
      usersFcmTokensSaved = findOne;
    }
    return usersFcmTokensSaved;
  }

  @authenticate('jwt')
  @post('/users-fcm-tokens/refreshed')
  @response(200, {
    description: 'UsersFcmTokens model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersFcmTokens)}},
  })
  async refreshedToken(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersFcmTokens, {
            title: 'NewUsersFcmTokens',
            exclude: ['id', 'userId'],
          }),
        },
      },
    })
    request: {oldToken: string; newToken: string},
  ): Promise<UsersFcmTokens> {
    const uId: number = Number(currentUserProfile[securityId]);
    await this.usersFcmTokensRepository.updateAll(
      {
        status: 2,
      },
      {userId: uId, token: request.oldToken},
    );
    const usersFcmTokensSaved = {
      userId: uId,
      status: 1,
      token: request.newToken,
      createdAt: new Date(),
    };

    return await this.usersFcmTokensRepository.create(usersFcmTokensSaved);
  }

  @authenticate('jwt')
  @post('/users-fcm-tokens/delete-token')
  @response(200, {
    description: 'UsersFcmTokens model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersFcmTokens)}},
  })
  async deleteToken(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersFcmTokens, {
            title: 'Delte Users FcmTokens',
            exclude: ['id', 'userId'],
          }),
        },
      },
    })
    request: {token: string},
  ): Promise<{message: string}> {
    const uId: number = Number(currentUserProfile[securityId]);
    await this.usersFcmTokensRepository.updateAll(
      {
        status: 2,
      },
      {userId: uId, token: request.token},
    );

    return {message: 'success'};
  }

  @get('/users-fcm-tokens/count')
  @response(200, {
    description: 'UsersFcmTokens model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UsersFcmTokens) where?: Where<UsersFcmTokens>,
  ): Promise<Count> {
    return this.usersFcmTokensRepository.count(where);
  }

  @get('/users-fcm-tokens')
  @response(200, {
    description: 'Array of UsersFcmTokens model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UsersFcmTokens, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UsersFcmTokens) filter?: Filter<UsersFcmTokens>,
  ): Promise<UsersFcmTokens[]> {
    return this.usersFcmTokensRepository.find(filter);
  }

  @patch('/users-fcm-tokens')
  @response(200, {
    description: 'UsersFcmTokens PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersFcmTokens, {partial: true}),
        },
      },
    })
    usersFcmTokens: UsersFcmTokens,
    @param.where(UsersFcmTokens) where?: Where<UsersFcmTokens>,
  ): Promise<Count> {
    return this.usersFcmTokensRepository.updateAll(usersFcmTokens, where);
  }

  @get('/users-fcm-tokens/{id}')
  @response(200, {
    description: 'UsersFcmTokens model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UsersFcmTokens, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UsersFcmTokens, {exclude: 'where'})
    filter?: FilterExcludingWhere<UsersFcmTokens>,
  ): Promise<UsersFcmTokens> {
    return this.usersFcmTokensRepository.findById(id, filter);
  }

  @patch('/users-fcm-tokens/{id}')
  @response(204, {
    description: 'UsersFcmTokens PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersFcmTokens, {partial: true}),
        },
      },
    })
    usersFcmTokens: UsersFcmTokens,
  ): Promise<void> {
    await this.usersFcmTokensRepository.updateById(id, usersFcmTokens);
  }

  @put('/users-fcm-tokens/{id}')
  @response(204, {
    description: 'UsersFcmTokens PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() usersFcmTokens: UsersFcmTokens,
  ): Promise<void> {
    await this.usersFcmTokensRepository.replaceById(id, usersFcmTokens);
  }

  @del('/users-fcm-tokens/{id}')
  @response(204, {
    description: 'UsersFcmTokens DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.usersFcmTokensRepository.deleteById(id);
  }
}
