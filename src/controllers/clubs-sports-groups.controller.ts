import {authenticate} from '@loopback/authentication';
import {
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
} from '@loopback/rest';
import {
  Clubs,
  SportsGroups,
} from '../models';
import {ClubsRepository} from '../repositories';

@authenticate('jwt')
export class ClubsSportsGroupsController {
  constructor(
    @repository(ClubsRepository)
    public clubsRepository: ClubsRepository,
  ) { }

  @get('/clubs/{id}/sports-groups', {
    responses: {
      '200': {
        description: 'SportsGroups belonging to Clubs',
        content: {
          'application/json': {
            schema: getModelSchemaRef(SportsGroups),
          },
        },
      },
    },
  })
  async getSportsGroups(
    @param.path.number('id') id: typeof Clubs.prototype.id,
  ): Promise<SportsGroups> {
    return this.clubsRepository.sportsGroup(id);
  }
}
