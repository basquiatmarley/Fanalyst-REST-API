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
import {UsersPredictions} from '../models';
import {UsersPredictionsRepository, UsersPredictionsSummariesAtsRepository, UsersPredictionsSummariesRepository} from '../repositories';

export class UsersPredictionsController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(JWTUserRepository) protected jwtUserRepository: JWTUserRepository,
    @repository(UsersPredictionsRepository)
    public usersPredictionsRepository: UsersPredictionsRepository,
    @repository(UsersPredictionsSummariesRepository)
    public usersPredSummaryRepo: UsersPredictionsSummariesRepository,
    @repository(UsersPredictionsSummariesAtsRepository)
    public usersPredSummaryAtsRepo: UsersPredictionsSummariesAtsRepository,
  ) { }

  @authenticate('jwt')
  @post('/users-predictions')
  @response(200, {
    description: 'UsersPredictions model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersPredictions)}},
  })
  async create(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictions, {
            title: 'NewUsersPredictions',
            exclude: ['id', 'updatedBy', 'updatedAt', 'statusDeleted',],
          }),
        },
      },
    })
    usersPredictions: Omit<UsersPredictions, 'id'>,
  ): Promise<UsersPredictions> {
    const uId: number = Number(currentUserProfile[securityId]);
    usersPredictions.createdBy = uId;
    const saved = await this.usersPredictionsRepository.create(usersPredictions);
    const dateNow = new Date();
    const month = dateNow.getMonth() + 1;
    const getOneSummary = await this.usersPredSummaryRepo.findOne({
      where: {
        userId: saved.createdBy,
        month: month,
        year: dateNow.getFullYear(),
      }
    });
    if (!getOneSummary) {
      await this.usersPredSummaryRepo.create({
        userId: saved.createdBy,
        countPrediction: 1,
        month: month,
        year: dateNow.getFullYear(),
      })
    } else {
      await this.usersPredSummaryRepo.updateById(getOneSummary.id, {countPrediction: getOneSummary.countPrediction + 1});
    }
    //ALL TIMES
    const getOneSummaryAts = await this.usersPredSummaryAtsRepo.findOne({
      where: {
        userId: saved.createdBy,
      }
    });
    if (!getOneSummaryAts) {
      await this.usersPredSummaryAtsRepo.create({
        userId: saved.createdBy,
        countPrediction: 1,
      })
    } else {
      await this.usersPredSummaryAtsRepo.updateById(getOneSummaryAts.id, {countPrediction: getOneSummaryAts.countPrediction + 1});
    }
    return saved;
  }

  @get('/users-predictions/count')
  @response(200, {
    description: 'UsersPredictions model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UsersPredictions) where?: Where<UsersPredictions>,
  ): Promise<Count> {
    return this.usersPredictionsRepository.count(where);
  }

  @get('/users-predictions')
  @response(200, {
    description: 'Array of UsersPredictions model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UsersPredictions, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UsersPredictions) filter?: Filter<UsersPredictions>,
  ): Promise<UsersPredictions[]> {
    return this.usersPredictionsRepository.find(filter);
  }

  @patch('/users-predictions')
  @response(200, {
    description: 'UsersPredictions PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictions, {partial: true}),
        },
      },
    })
    usersPredictions: UsersPredictions,
    @param.where(UsersPredictions) where?: Where<UsersPredictions>,
  ): Promise<Count> {
    return this.usersPredictionsRepository.updateAll(usersPredictions, where);
  }

  @get('/users-predictions/{id}')
  @response(200, {
    description: 'UsersPredictions model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UsersPredictions, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UsersPredictions, {exclude: 'where'}) filter?: FilterExcludingWhere<UsersPredictions>
  ): Promise<UsersPredictions> {
    return this.usersPredictionsRepository.findById(id, filter);
  }

  @patch('/users-predictions/{id}')
  @response(204, {
    description: 'UsersPredictions PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictions, {partial: true}),
        },
      },
    })
    usersPredictions: UsersPredictions,
  ): Promise<void> {
    await this.usersPredictionsRepository.updateById(id, usersPredictions);
  }

  @put('/users-predictions/{id}')
  @response(204, {
    description: 'UsersPredictions PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() usersPredictions: UsersPredictions,
  ): Promise<void> {
    await this.usersPredictionsRepository.replaceById(id, usersPredictions);
  }

  @del('/users-predictions/{id}')
  @response(204, {
    description: 'UsersPredictions DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.usersPredictionsRepository.deleteById(id);
  }
}
