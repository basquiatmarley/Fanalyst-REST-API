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
import {Random} from 'random-js';
import {Events, EventsWithRelations} from '../models';
import {EventsRepository} from '../repositories';

@authenticate('jwt')
export class EventsController {
  constructor(
    @repository(EventsRepository)
    public eventsRepository: EventsRepository,
  ) {}

  @post('/events')
  @response(200, {
    description: 'Events model instance',
    content: {'application/json': {schema: getModelSchemaRef(Events)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Events, {
            title: 'NewEvents',
            exclude: ['id'],
          }),
        },
      },
    })
    events: Omit<Events, 'id'>,
  ): Promise<Events> {
    return this.eventsRepository.create(events);
  }

  @get('/events/count')
  @response(200, {
    description: 'Events model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Events) where?: Where<Events>): Promise<Count> {
    return this.eventsRepository.count(where);
  }

  @get('/events')
  @response(200, {
    description: 'Array of Events model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Events, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Events) filter?: Filter<Events>,
  ): Promise<EventsWithRelations[]> {
    const finalFilter = filter ?? {};
    let randomCreated = false;
    let limitShowRandom = 0;

    if (finalFilter?.order != null) {
      if (Array.isArray(finalFilter?.order)) {
        var orderFilter = finalFilter.order;
        if (orderFilter[0] == 'RAND') {
          randomCreated = true;
          limitShowRandom = +orderFilter[1];

          finalFilter.order = [];
        }
      }
    }
    const datas = await this.eventsRepository.find(finalFilter);
    if (randomCreated == true && datas != null) {
      const random = new Random();
      const shuffled = random.shuffle(datas);
      // console.log(shuffled);
      return shuffled.slice(0, limitShowRandom);
    }

    return datas;
  }

  @get('/events/pagination')
  @response(200, {
    description: 'Array of Events model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Events, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(@param.filter(Events) filter?: Filter<Events>): Promise<{
    records: Events[];
    totalCount: number | 0;
  }> {
    var records = await this.eventsRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.eventsRepository.count(where);
    return {records: records, totalCount: totalCountData.count};
  }

  @patch('/events')
  @response(200, {
    description: 'Events PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Events, {partial: true}),
        },
      },
    })
    events: Events,
    @param.where(Events) where?: Where<Events>,
  ): Promise<Count> {
    return this.eventsRepository.updateAll(events, where);
  }

  @get('/events/{id}')
  @response(200, {
    description: 'Events model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Events, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Events, {exclude: 'where'})
    filter?: FilterExcludingWhere<Events>,
  ): Promise<Events> {
    return this.eventsRepository.findById(id, filter);
  }

  @patch('/events/{id}')
  @response(204, {
    description: 'Events PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Events, {partial: true}),
        },
      },
    })
    events: Events,
  ): Promise<void> {
    await this.eventsRepository.updateById(id, events);
  }

  @put('/events/{id}')
  @response(204, {
    description: 'Events PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() events: Events,
  ): Promise<void> {
    await this.eventsRepository.replaceById(id, events);
  }

  @del('/events/{id}')
  @response(204, {
    description: 'Events DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.eventsRepository.deleteById(id);
  }
}
