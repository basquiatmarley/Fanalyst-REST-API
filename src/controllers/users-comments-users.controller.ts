import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UsersComments,
  Users,
} from '../models';
import {UsersCommentsRepository} from '../repositories';

export class UsersCommentsUsersController {
  constructor(
    @repository(UsersCommentsRepository)
    public usersCommentsRepository: UsersCommentsRepository,
  ) { }

  @get('/users-comments/{id}/users', {
    responses: {
      '200': {
        description: 'Users belonging to UsersComments',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Users),
          },
        },
      },
    },
  })
  async getUsers(
    @param.path.number('id') id: typeof UsersComments.prototype.id,
  ): Promise<Users> {
    return this.usersCommentsRepository.userCreated(id);
  }
}
