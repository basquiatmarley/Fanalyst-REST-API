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
import {Odds} from '../models';
import {OddsRepository} from '../repositories';

@authenticate('jwt')
export class OddsController {
  constructor(
    @repository(OddsRepository)
    public oddsRepository: OddsRepository,
  ) { }

  @post('/odds')
  @response(200, {
    description: 'Odds model instance',
    content: {'application/json': {schema: getModelSchemaRef(Odds)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Odds, {
            title: 'NewOdds',
            exclude: ['id'],
          }),
        },
      },
    })
    odds: Omit<Odds, 'id'>,
  ): Promise<Odds> {
    return this.oddsRepository.create(odds);
  }

  @get('/odds/count')
  @response(200, {
    description: 'Odds model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Odds) where?: Where<Odds>,
  ): Promise<Count> {
    return this.oddsRepository.count(where);
  }

  @get('/odds')
  @response(200, {
    description: 'Array of Odds model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Odds, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Odds) filter?: Filter<Odds>,
  ): Promise<Odds[]> {
    return this.oddsRepository.find(filter);
  }

  @patch('/odds')
  @response(200, {
    description: 'Odds PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Odds, {partial: true}),
        },
      },
    })
    odds: Odds,
    @param.where(Odds) where?: Where<Odds>,
  ): Promise<Count> {
    return this.oddsRepository.updateAll(odds, where);
  }

  @get('/odds/{id}')
  @response(200, {
    description: 'Odds model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Odds, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Odds, {exclude: 'where'}) filter?: FilterExcludingWhere<Odds>
  ): Promise<Odds> {
    return this.oddsRepository.findById(id, filter);
  }

  @patch('/odds/{id}')
  @response(204, {
    description: 'Odds PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Odds, {partial: true}),
        },
      },
    })
    odds: Odds,
  ): Promise<void> {
    await this.oddsRepository.updateById(id, odds);
  }

  @put('/odds/{id}')
  @response(204, {
    description: 'Odds PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() odds: Odds,
  ): Promise<void> {
    await this.oddsRepository.replaceById(id, odds);
  }

  @del('/odds/{id}')
  @response(204, {
    description: 'Odds DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.oddsRepository.deleteById(id);
  }
}
