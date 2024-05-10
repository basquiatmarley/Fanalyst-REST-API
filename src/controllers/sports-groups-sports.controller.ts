import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Sports,
  SportsGroups,
} from '../models';
import {SportsGroupsRepository} from '../repositories';


@authenticate('jwt')
export class SportsGroupsSportsController {
  constructor(
    @repository(SportsGroupsRepository) protected sportsGroupsRepository: SportsGroupsRepository,
  ) { }

  @get('/sports-groups/{id}/sports', {
    responses: {
      '200': {
        description: 'Array of SportsGroups has many Sports',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Sports)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Sports>,
  ): Promise<Sports[]> {
    return this.sportsGroupsRepository.sports(id).find(filter);
  }

  @post('/sports-groups/{id}/sports', {
    responses: {
      '200': {
        description: 'SportsGroups model instance',
        content: {'application/json': {schema: getModelSchemaRef(Sports)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof SportsGroups.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sports, {
            title: 'NewSportsInSportsGroups',
            exclude: ['id'],
            optional: ['sportsGroupId']
          }),
        },
      },
    }) sports: Omit<Sports, 'id'>,
  ): Promise<Sports> {
    return this.sportsGroupsRepository.sports(id).create(sports);
  }

  @patch('/sports-groups/{id}/sports', {
    responses: {
      '200': {
        description: 'SportsGroups.Sports PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Sports, {partial: true}),
        },
      },
    })
    sports: Partial<Sports>,
    @param.query.object('where', getWhereSchemaFor(Sports)) where?: Where<Sports>,
  ): Promise<Count> {
    return this.sportsGroupsRepository.sports(id).patch(sports, where);
  }

  @del('/sports-groups/{id}/sports', {
    responses: {
      '200': {
        description: 'SportsGroups.Sports DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Sports)) where?: Where<Sports>,
  ): Promise<Count> {
    return this.sportsGroupsRepository.sports(id).delete(where);
  }
}
