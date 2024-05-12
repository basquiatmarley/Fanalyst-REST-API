import {authenticate} from '@loopback/authentication';
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
import {Scores} from '../models';
import {ScoresRepository} from '../repositories';

@authenticate('jwt')
export class ScoresController {
  constructor(
    @repository(ScoresRepository)
    public scoresRepository: ScoresRepository,
  ) {}

  @post('/scores')
  @response(200, {
    description: 'Scores model instance',
    content: {'application/json': {schema: getModelSchemaRef(Scores)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scores, {
            title: 'NewScores',
            exclude: ['id'],
          }),
        },
      },
    })
    scores: Omit<Scores, 'id'>,
  ): Promise<Scores> {
    return this.scoresRepository.create(scores);
  }

  @get('/scores/count')
  @response(200, {
    description: 'Scores model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Scores) where?: Where<Scores>): Promise<Count> {
    return this.scoresRepository.count(where);
  }

  @get('/scores')
  @response(200, {
    description: 'Array of Scores model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Scores, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Scores) filter?: Filter<Scores>): Promise<Scores[]> {
    return this.scoresRepository.find(filter);
  }

  @patch('/scores')
  @response(200, {
    description: 'Scores PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scores, {partial: true}),
        },
      },
    })
    scores: Scores,
    @param.where(Scores) where?: Where<Scores>,
  ): Promise<Count> {
    return this.scoresRepository.updateAll(scores, where);
  }

  @get('/scores/{id}')
  @response(200, {
    description: 'Scores model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Scores, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Scores, {exclude: 'where'})
    filter?: FilterExcludingWhere<Scores>,
  ): Promise<Scores> {
    return this.scoresRepository.findById(id, filter);
  }

  @patch('/scores/{id}')
  @response(204, {
    description: 'Scores PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scores, {partial: true}),
        },
      },
    })
    scores: Scores,
  ): Promise<void> {
    await this.scoresRepository.updateById(id, scores);
  }

  @put('/scores/{id}')
  @response(204, {
    description: 'Scores PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() scores: Scores,
  ): Promise<void> {
    await this.scoresRepository.replaceById(id, scores);
  }

  @del('/scores/{id}')
  @response(204, {
    description: 'Scores DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.scoresRepository.deleteById(id);
  }
}
