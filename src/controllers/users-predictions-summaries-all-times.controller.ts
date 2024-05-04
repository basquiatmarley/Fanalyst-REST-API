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
import {UsersPredictionsSummariesAts} from '../models';
import {UsersPredictionsSummariesAtsRepository} from '../repositories';

export class UsersPredictionsSummariesAtsController {
  constructor(
    @repository(UsersPredictionsSummariesAtsRepository)
    public usersPredictionsSummariesAtsRepository: UsersPredictionsSummariesAtsRepository,
  ) { }


  @get('/users-predictions-ats')
  @response(200, {
    description: 'Array of UsersPredictionsSummariesAts model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UsersPredictionsSummariesAts, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UsersPredictionsSummariesAts) filter?: Filter<UsersPredictionsSummariesAts>,
  ): Promise<UsersPredictionsSummariesAts[]> {
    return this.usersPredictionsSummariesAtsRepository.find(filter);
  }

  @get('/users-predictions-ats/{id}')
  @response(200, {
    description: 'UsersPredictionsSummaries model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UsersPredictionsSummariesAts, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UsersPredictionsSummariesAts, {exclude: 'where'}) filter?: FilterExcludingWhere<UsersPredictionsSummariesAts>
  ): Promise<UsersPredictionsSummariesAts> {
    return this.usersPredictionsSummariesAtsRepository.findById(id, filter);
  }

}
