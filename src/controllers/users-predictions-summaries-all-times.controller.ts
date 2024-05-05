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

  @get('/users-predictions-ats/get-position/{id}')
  @response(200, {
    description: 'UsersPredictionsSummaries model instance',
  })
  async getPosition(
    @param.path.number('id') id: number,
  ): Promise<{message: String, position: number, data: UsersPredictionsSummariesAts | null}> {
    var sql = "SELECT row_position,longestWinStreak,statusWinStreak FROM( SELECT userId,longestWinStreak,statusWinStreak, ROW_NUMBER() OVER(ORDER BY longestWinStreak DESC) AS row_position FROM users_predictions_all_times) AS subquery WHERE userId = ? ";
    var date = new Date();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    const results = await this.usersPredictionsSummariesAtsRepository.executeCustomQuery(sql, [id]);

    var findByUId = await this.usersPredictionsSummariesAtsRepository.findOne({
      where: {
        and: [
          {"userId": id},
        ]
      },
      include: [
        {relation: "user", required: true},
      ]
    })

    if (results.length === 0) {
      return {"message": "failed", "position": 0, "data": null};
    }
    return {"message": "success", "position": results[0]['row_position'], data: findByUId};
  }

}
