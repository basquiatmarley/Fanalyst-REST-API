import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
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
import {Clubs} from '../models';
import {ClubsRepository} from '../repositories';


@authenticate('jwt')
export class ClubsController {
  constructor(
    @repository(ClubsRepository)
    public clubsRepository: ClubsRepository,
  ) { }

  @post('/clubs')
  @response(200, {
    description: 'Clubs model instance',
    content: {'application/json': {schema: getModelSchemaRef(Clubs)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Clubs, {
            title: 'NewClubs',
            exclude: ['id'],
          }),
        },
      },
    })
    clubs: Omit<Clubs, 'id'>,
  ): Promise<Clubs> {
    return this.clubsRepository.create(clubs);
  }

  @get('/clubs/count')
  @response(200, {
    description: 'Clubs model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Clubs) where?: Where<Clubs>,
  ): Promise<Count> {
    return this.clubsRepository.count(where);
  }

  @get('/clubs')
  @response(200, {
    description: 'Array of Clubs model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Clubs, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Clubs) filter?: Filter<Clubs>,
  ): Promise<Clubs[]> {

    return this.clubsRepository.find(filter);
  }


  @patch('/clubs')
  @response(200, {
    description: 'Clubs PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Clubs, {partial: true}),
        },
      },
    })
    clubs: Clubs,
    @param.where(Clubs) where?: Where<Clubs>,
  ): Promise<Count> {
    return this.clubsRepository.updateAll(clubs, where);
  }

  @get('/clubs/{id}')
  @response(200, {
    description: 'Clubs model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Clubs, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Clubs, {exclude: 'where'}) filter?: FilterExcludingWhere<Clubs>
  ): Promise<Clubs> {
    return this.clubsRepository.findById(id, filter);
  }

  @patch('/clubs/{id}')
  @response(204, {
    description: 'Clubs PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Clubs, {partial: true}),
        },
      },
    })
    clubs: Clubs,
  ): Promise<Clubs> {

    await this.clubsRepository.updateById(id, clubs);
    return this.clubsRepository.findById(id);
  }

  @put('/clubs/{id}')
  @response(204, {
    description: 'Clubs PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() clubs: Clubs,
  ): Promise<Clubs> {
    await this.clubsRepository.updateById(id, clubs);
    return this.clubsRepository.findById(id);
  }

  @del('/clubs/{id}')
  @response(204, {
    description: 'Clubs DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.clubsRepository.deleteById(id);
  }
}
