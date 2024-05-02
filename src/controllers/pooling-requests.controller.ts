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
  response
} from '@loopback/rest';
import {PoolingRequests} from '../models';
import {ClubsRepository, EventsRepository, OddsRepository, PoolingRequestsRepository, ScoresRepository, SportsGroupsRepository, SportsRepository} from '../repositories';

export class PoolingRequestsController {
  constructor(
    @repository(PoolingRequestsRepository) public poolingRequestsRepository: PoolingRequestsRepository,
    @repository(SportsGroupsRepository) public sportsGroupsRepository: SportsGroupsRepository,
    @repository(SportsRepository) public sportsRepository: SportsRepository,
    @repository(ClubsRepository) public clubsRepository: ClubsRepository,
    @repository(EventsRepository) public eventsRepository: EventsRepository,
    @repository(OddsRepository) public oddsRepository: OddsRepository,
    @repository(ScoresRepository) public scoresRepository: ScoresRepository,
  ) { }

  @post('/pooling-requests')
  @response(200, {
    description: 'PoolingRequests model instance',
    content: {'application/json': {schema: getModelSchemaRef(PoolingRequests)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PoolingRequests, {
            title: 'NewPoolingRequests',
            exclude: ['id'],
          }),
        },
      },
    })
    poolingRequests: Omit<PoolingRequests, 'id'>,
  ): Promise<PoolingRequests> {
    return this.poolingRequestsRepository.create(poolingRequests);
  }

  @get('/pooling-requests/count')
  @response(200, {
    description: 'PoolingRequests model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(PoolingRequests) where?: Where<PoolingRequests>,
  ): Promise<Count> {
    return this.poolingRequestsRepository.count(where);
  }

  @get('/pooling-requests')
  @response(200, {
    description: 'Array of PoolingRequests model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PoolingRequests, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(PoolingRequests) filter?: Filter<PoolingRequests>,
  ): Promise<PoolingRequests[]> {
    return this.poolingRequestsRepository.find(filter);
  }

  @patch('/pooling-requests')
  @response(200, {
    description: 'PoolingRequests PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PoolingRequests, {partial: true}),
        },
      },
    })
    poolingRequests: PoolingRequests,
    @param.where(PoolingRequests) where?: Where<PoolingRequests>,
  ): Promise<Count> {
    return this.poolingRequestsRepository.updateAll(poolingRequests, where);
  }

  @get('/pooling-requests/{id}')
  @response(200, {
    description: 'PoolingRequests model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PoolingRequests, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PoolingRequests, {exclude: 'where'}) filter?: FilterExcludingWhere<PoolingRequests>
  ): Promise<PoolingRequests> {
    return this.poolingRequestsRepository.findById(id, filter);
  }

  @patch('/pooling-requests/{id}')
  @response(204, {
    description: 'PoolingRequests PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PoolingRequests, {partial: true}),
        },
      },
    })
    poolingRequests: PoolingRequests,
  ): Promise<void> {
    await this.poolingRequestsRepository.updateById(id, poolingRequests);
  }

  @put('/pooling-requests/{id}')
  @response(204, {
    description: 'PoolingRequests PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() poolingRequests: PoolingRequests,
  ): Promise<void> {
    await this.poolingRequestsRepository.replaceById(id, poolingRequests);
  }

  @del('/pooling-requests/{id}')
  @response(204, {
    description: 'PoolingRequests DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.poolingRequestsRepository.deleteById(id);
  }
}
