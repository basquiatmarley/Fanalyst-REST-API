import {
  Filter,
  FilterExcludingWhere,
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  response
} from '@loopback/rest';
import {UsersPredictionsSummaries} from '../models';
import {UsersPredictionsSummariesRepository} from '../repositories';

export class UsersPredictionsSummariesController {
  constructor(
    @repository(UsersPredictionsSummariesRepository)
    public usersPredictionsSummariesRepository: UsersPredictionsSummariesRepository,
  ) { }


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

}
