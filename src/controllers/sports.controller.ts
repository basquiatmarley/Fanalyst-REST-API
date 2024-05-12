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
import {Sports} from '../models';
import {SportsRepository} from '../repositories';

@authenticate('jwt')
export class SportsController {
  constructor(
    @repository(SportsRepository)
    public sportsRepository: SportsRepository,
  ) { }

  @post('/sports')
  @response(200, {
    description: 'Sports model instance',
    content: {'application/json': {schema: getModelSchemaRef(Sports)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sports, {
            title: 'NewSports',
            exclude: ['id'],
          }),
        },
      },
    })
    sports: Omit<Sports, 'id'>,
  ): Promise<Sports> {
    return this.sportsRepository.create(sports);
  }

  @get('/sports/count')
  @response(200, {
    description: 'Sports model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Sports) where?: Where<Sports>): Promise<Count> {
    return this.sportsRepository.count(where);
  }

  @get('/sports')
  @response(200, {
    description: 'Array of Sports model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Sports, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Sports) filter?: Filter<Sports>): Promise<Sports[]> {
    return this.sportsRepository.find(filter);
  }

  @get('/sports/pagination')
  @response(200, {
    description: 'Array of pagination Sports model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Sports, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(@param.filter(Sports) filter?: Filter<Sports>): Promise<{
    records: Sports[];
    totalCount: number | 0;
  }> {
    var records = await this.sportsRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.sportsRepository.count(where, {include: filter?.include});
    return {records: records, totalCount: totalCountData.count};
  }

  @patch('/sports')
  @response(200, {
    description: 'Sports PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sports, {partial: true}),
        },
      },
    })
    sports: Sports,
    @param.where(Sports) where?: Where<Sports>,
  ): Promise<Count> {
    return this.sportsRepository.updateAll(sports, where);
  }

  @get('/sports/{id}')
  @response(200, {
    description: 'Sports model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Sports, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Sports, {exclude: 'where'})
    filter?: FilterExcludingWhere<Sports>,
  ): Promise<Sports> {
    return this.sportsRepository.findById(id, filter);
  }

  @patch('/sports/{id}')
  @response(204, {
    description: 'Sports PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sports, {partial: true}),
        },
      },
    })
    sports: Sports,
  ): Promise<Sports> {
    await this.sportsRepository.updateById(id, sports);
    return await this.sportsRepository.findById(id);
  }

  @put('/sports/{id}')
  @response(204, {
    description: 'Sports PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() sports: Sports,
  ): Promise<Sports> {
    await this.sportsRepository.replaceById(id, sports);
    return await this.sportsRepository.findById(id);
  }

  @del('/sports/{id}')
  @response(204, {
    description: 'Sports DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.sportsRepository.deleteById(id);
  }
}
