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
import {genSalt, hash} from 'bcryptjs';
import {Users} from '../models';
import {UsersRepository} from '../repositories';

export class UsersController {
  constructor(
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
  ) { }

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'NewUser',
            exclude: ['id', 'statusDeleted', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'statusDeleted'],
          }),
        },
      },
    })
    user: Omit<Users, 'id'>,
  ): Promise<Users> {
    user.password = await hash(user.password, await genSalt());
    return this.usersRepository.create(user);
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Users) where?: Where<Users>,
  ): Promise<Count> {
    return this.usersRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Users, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Users) filter?: Filter<Users>,
  ): Promise<Users[]> {
    return this.usersRepository.find(filter);
  }

  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    user: Users,
    @param.where(Users) where?: Where<Users>,
  ): Promise<Count> {
    return this.usersRepository.updateAll(user, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Users, {exclude: 'where'}) filter?: FilterExcludingWhere<Users>
  ): Promise<Users> {
    return this.usersRepository.findById(id, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    user: Users,
  ): Promise<Users> {
    if (user.password != '') {
      user.password = await hash(user.password, await genSalt());
    }
    await this.usersRepository.updateById(id, user);
    return this.usersRepository.findById(id);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() user: Users,
  ): Promise<Users> {
    if (user.password != '') {
      user.password = await hash(user.password, await genSalt());
    }
    await this.usersRepository.replaceById(id, user);
    return this.usersRepository.findById(id);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.usersRepository.deleteById(id);
  }
}
