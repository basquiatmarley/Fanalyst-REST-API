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
import {UsersPredictionsSummaries} from '../models';
import {UsersPredictionsSummariesRepository} from '../repositories';

export class UsersPredictionsSummariesController {
  constructor(
    @repository(UsersPredictionsSummariesRepository)
    public usersPredictionsSummariesRepository: UsersPredictionsSummariesRepository,
  ) { }

  @post('/users-predictions-summaries')
  @response(200, {
    description: 'UsersPredictionsSummaries model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersPredictionsSummaries)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictionsSummaries, {
            title: 'NewUsersPredictionsSummaries',
            exclude: ['id'],
          }),
        },
      },
    })
    usersPredictionsSummaries: Omit<UsersPredictionsSummaries, 'id'>,
  ): Promise<UsersPredictionsSummaries> {
    return this.usersPredictionsSummariesRepository.create(usersPredictionsSummaries);
  }

  @get('/users-predictions-summaries/count')
  @response(200, {
    description: 'UsersPredictionsSummaries model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UsersPredictionsSummaries) where?: Where<UsersPredictionsSummaries>,
  ): Promise<Count> {
    return this.usersPredictionsSummariesRepository.count(where);
  }

  @get('/users-predictions-summaries')
  @response(200, {
    description: 'Array of UsersPredictionsSummaries model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UsersPredictionsSummaries, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UsersPredictionsSummaries) filter?: Filter<UsersPredictionsSummaries>,
  ): Promise<UsersPredictionsSummaries[]> {
    return this.usersPredictionsSummariesRepository.find(filter);
  }

  @patch('/users-predictions-summaries')
  @response(200, {
    description: 'UsersPredictionsSummaries PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictionsSummaries, {partial: true}),
        },
      },
    })
    usersPredictionsSummaries: UsersPredictionsSummaries,
    @param.where(UsersPredictionsSummaries) where?: Where<UsersPredictionsSummaries>,
  ): Promise<Count> {
    return this.usersPredictionsSummariesRepository.updateAll(usersPredictionsSummaries, where);
  }

  @get('/users-predictions-summaries/{id}')
  @response(200, {
    description: 'UsersPredictionsSummaries model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UsersPredictionsSummaries, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UsersPredictionsSummaries, {exclude: 'where'}) filter?: FilterExcludingWhere<UsersPredictionsSummaries>
  ): Promise<UsersPredictionsSummaries> {
    return this.usersPredictionsSummariesRepository.findById(id, filter);
  }

  @patch('/users-predictions-summaries/{id}')
  @response(204, {
    description: 'UsersPredictionsSummaries PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersPredictionsSummaries, {partial: true}),
        },
      },
    })
    usersPredictionsSummaries: UsersPredictionsSummaries,
  ): Promise<void> {
    await this.usersPredictionsSummariesRepository.updateById(id, usersPredictionsSummaries);
  }

  @put('/users-predictions-summaries/{id}')
  @response(204, {
    description: 'UsersPredictionsSummaries PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() usersPredictionsSummaries: UsersPredictionsSummaries,
  ): Promise<void> {
    await this.usersPredictionsSummariesRepository.replaceById(id, usersPredictionsSummaries);
  }

  @del('/users-predictions-summaries/{id}')
  @response(204, {
    description: 'UsersPredictionsSummaries DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.usersPredictionsSummariesRepository.deleteById(id);
  }
}
