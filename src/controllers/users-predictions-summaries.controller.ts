import {authenticate} from '@loopback/authentication';
import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, response} from '@loopback/rest';
import {UsersPredictionsSummaries} from '../models';
import {UsersPredictionsSummariesRepository} from '../repositories';

@authenticate('jwt')
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
          items: getModelSchemaRef(UsersPredictionsSummaries, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(UsersPredictionsSummaries)
    filter?: Filter<UsersPredictionsSummaries>,
  ): Promise<UsersPredictionsSummaries[]> {
    return this.usersPredictionsSummariesRepository.find(filter);
  }

  @get('/users-predictions-summaries/{id}')
  @response(200, {
    description: 'UsersPredictionsSummaries model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UsersPredictionsSummaries, {
          includeRelations: true,
        }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UsersPredictionsSummaries, {exclude: 'where'})
    filter?: FilterExcludingWhere<UsersPredictionsSummaries>,
  ): Promise<UsersPredictionsSummaries> {
    return this.usersPredictionsSummariesRepository.findById(id, filter);
  }

  @get('/users-predictions-summaries/get-position/{id}')
  @response(200, {
    description: 'UsersPredictionsSummaries model instance',
  })
  async getPosition(
    @param.path.number('id') id: number,
  ): Promise<{
    message: String;
    position: number;
    data: UsersPredictionsSummaries | null;
  }> {
    var sql =
      'SELECT row_position FROM( SELECT userId, ROW_NUMBER() OVER(ORDER BY longestWinStreak DESC, percentageWin DESC ) AS row_position FROM users_predictions_summaries WHERE `month` = ? AND `year` = ?) AS subquery WHERE userId = ? ';
    var date = new Date();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    const results =
      await this.usersPredictionsSummariesRepository.executeCustomQuery(sql, [
        month,
        year,
        id,
      ]);

    var findByUId = await this.usersPredictionsSummariesRepository.findOne({
      where: {
        and: [{userId: id}, {month: month}, {year: year}],
      },
      include: [{relation: 'user', required: true}],
    });

    if (results.length === 0) {
      return {message: 'failed', position: 0, data: null};
    }
    return {
      message: 'success',
      position: results[0]['row_position'],
      data: findByUId,
    };
  }
}
