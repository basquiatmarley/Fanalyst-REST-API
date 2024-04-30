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
import {UsersPredictions} from '../models';
import {UsersPredictionsRepository} from '../repositories';

export class UsersPredictionsController {
  constructor(
    @repository(UsersPredictionsRepository)
    public usersPredictionsRepository: UsersPredictionsRepository,
  ) { }

  @post('/users-predictions')
  @response(200, {
    description: 'UsersPredictions model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersPredictions)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictions, {
            title: 'NewUsersPredictions',
            exclude: ['id', 'updatedBy', 'updatedAt', 'statusDeleted'],
          }),
        },
      },
    })
    usersPredictions: Omit<UsersPredictions, 'id'>,
  ): Promise<UsersPredictions> {
    return this.usersPredictionsRepository.create(usersPredictions);
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
