import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Sports, SportsGroups} from '../models';
import {SportsRepository} from '../repositories';

@authenticate('jwt')
export class SportsSportsGroupsController {
  constructor(
    @repository(SportsRepository)
    public sportsRepository: SportsRepository,
  ) {}

  @get('/sports/{id}/sports-groups', {
    responses: {
      '200': {
        description: 'SportsGroups belonging to Sports',
        content: {
          'application/json': {
            schema: getModelSchemaRef(SportsGroups),
          },
        },
      },
    },
  })
  async getSportsGroups(
    @param.path.number('id') id: typeof Sports.prototype.id,
  ): Promise<SportsGroups> {
    return this.sportsRepository.sportsGroup(id);
  }
}
