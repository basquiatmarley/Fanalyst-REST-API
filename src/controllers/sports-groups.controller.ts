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
import {SportsGroups} from '../models';
import {SportsGroupsRepository} from '../repositories';

@authenticate('jwt')
export class SportsGroupsController {
  constructor(
    @repository(SportsGroupsRepository)
    public sportsGroupsRepository: SportsGroupsRepository,
  ) {}

  @post('/sports-groups')
  @response(200, {
    description: 'SportsGroups model instance',
    content: {'application/json': {schema: getModelSchemaRef(SportsGroups)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SportsGroups, {
            title: 'NewSportsGroups',
            exclude: ['id'],
          }),
        },
      },
    })
    sportsGroups: Omit<SportsGroups, 'id'>,
  ): Promise<SportsGroups> {
    return this.sportsGroupsRepository.create(sportsGroups);
  }

  @get('/sports-groups/count')
  @response(200, {
    description: 'SportsGroups model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(SportsGroups) where?: Where<SportsGroups>,
  ): Promise<Count> {
    return this.sportsGroupsRepository.count(where);
  }

  @get('/sports-groups')
  @response(200, {
    description: 'Array of SportsGroups model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(SportsGroups, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(SportsGroups) filter?: Filter<SportsGroups>,
  ): Promise<SportsGroups[]> {
    return this.sportsGroupsRepository.find(filter);
  }

  @get('/sports-groups/pagination')
  @response(200, {
    description: 'Array of SportsGroups model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(SportsGroups, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(
    @param.filter(SportsGroups) filter?: Filter<SportsGroups>,
  ): Promise<{
    records: SportsGroups[];
    totalCount: number | 0;
  }> {
    var records = await this.sportsGroupsRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.sportsGroupsRepository.count(where);
    return {records: records, totalCount: totalCountData.count};
  }

  @patch('/sports-groups')
  @response(200, {
    description: 'SportsGroups PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SportsGroups, {partial: true}),
        },
      },
    })
    sportsGroups: SportsGroups,
    @param.where(SportsGroups) where?: Where<SportsGroups>,
  ): Promise<Count> {
    return this.sportsGroupsRepository.updateAll(sportsGroups, where);
  }

  @get('/sports-groups/{id}')
  @response(200, {
    description: 'SportsGroups model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(SportsGroups, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(SportsGroups, {exclude: 'where'})
    filter?: FilterExcludingWhere<SportsGroups>,
  ): Promise<SportsGroups> {
    return this.sportsGroupsRepository.findById(id, filter);
  }

  @patch('/sports-groups/{id}')
  @response(204, {
    description: 'SportsGroups PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SportsGroups, {partial: true}),
        },
      },
    })
    sportsGroups: SportsGroups,
  ): Promise<SportsGroups> {
    await this.sportsGroupsRepository.updateById(id, sportsGroups);
    return this.sportsGroupsRepository.findById(id);
  }

  @put('/sports-groups/{id}')
  @response(204, {
    description: 'SportsGroups PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() sportsGroups: SportsGroups,
  ): Promise<SportsGroups> {
    await this.sportsGroupsRepository.replaceById(id, sportsGroups);
    return this.sportsGroupsRepository.findById(id);
  }

  @del('/sports-groups/{id}')
  @response(204, {
    description: 'SportsGroups DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.sportsGroupsRepository.deleteById(id);
  }
}
