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
  HttpErrors,
  param,
  parseJson,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Events, PoolingRequests} from '../models';
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

  @get('/pooling-requests/execute/{id}')
  @response(200, {
    description: 'PoolingRequests Execute Pooling',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PoolingRequests, {includeRelations: true}),
      },
    },
  })
  async findDataById(
    @param.path.number('id') id: number,
    @param.filter(PoolingRequests, {exclude: 'where'}) filter?: FilterExcludingWhere<PoolingRequests>
  ): Promise<object> {
    try {
      const data = await this.poolingRequestsRepository.findById(id, filter);
      const responseString = data.response ?? "";
      const responseJson = parseJson(responseString);
      const now = new Date().toISOString();
      if (data.type == "sports") {
        var SportsObject = [];

        const groupSports = responseJson.reduce((acc: {[x: string]: any;}, item: {[x: string]: string;}) => {
          const key = item['group'];
          // console.log(key)
          console.log
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {});
        for (const [keySportGroup, items] of Object.entries(groupSports)) {
          const getSportsGroup = await this.sportsGroupsRepository.findOne({where: {title: keySportGroup.trim()}});
          let sportsGroupId: number | undefined;;
          if (getSportsGroup) {
            // If it exists, use its ID
            sportsGroupId = getSportsGroup.id;
          } else {
            const dataSaved = {
              title: keySportGroup.trim(),
              statusHotest: 1,
              status: 1,
              imageUrl: "",
              createdAt: now,
              updatedAt: now
            }
            await this.sportsGroupsRepository.create(dataSaved);

          }
        }
        for (const eventData of responseJson) {
          const findOneSportGroup = await this.sportsGroupsRepository.findOne({where: {title: eventData.group}});
          if (findOneSportGroup) {
            const sportsGroupId = findOneSportGroup.id;
            const getSport = await this.sportsRepository.findOne({where: {key: eventData.key.trim()}});
            if (!getSport) {
              const dataSaved = {
                sportsGroupId: sportsGroupId,
                title: eventData.title.trim(),
                status: eventData.active,
                key: eventData.key.trim(),
                imageUrl: "",
                createdAt: now,
                updatedAt: now
              }
              await this.sportsRepository.create(dataSaved);
            } else {
              const dataSaved = {
                sportsGroupId: sportsGroupId,
                title: eventData.title.trim(),
                status: eventData.active,
                key: eventData.key.trim(),
                updatedAt: now
              }
              await this.sportsRepository.updateById(getSport.id, dataSaved);
            }
          }

        }
      } else if (data.type == "events") {
        for (const eventDataJson of responseJson) {
          const filter = {where: {key: eventDataJson.sport_key.trim()}};
          const getSport = await this.sportsRepository.findOne(filter);
          let homeClub = await this.clubsRepository.findOne({where: {name: eventDataJson.home_team.trim()}});
          if (!homeClub) {
            homeClub = await this.clubsRepository.create({
              sportsGroupId: getSport?.sportsGroupId,
              name: eventDataJson.home_team.trim(),
              status: 1,
              imageUrl: "",
              createdAt: now,
              updatedAt: now
            });
          }
          let awayClub = await this.clubsRepository.findOne({where: {name: eventDataJson.away_team.trim()}});
          if (!awayClub) {
            awayClub = await this.clubsRepository.create({
              sportsGroupId: getSport?.sportsGroupId,
              name: eventDataJson.away_team.trim(),
              status: 1,
              imageUrl: "",
              createdAt: now,
              updatedAt: now
            });
          }
          const existEventData = await this.eventsRepository.findOne({where: {id: eventDataJson.id}});
          let newEvent: Events;

          if (!existEventData) {
            // Create new event
            newEvent = await this.eventsRepository.create({
              id: eventDataJson.id,
              sportsGroupId: getSport?.sportsGroupId,
              sportId: getSport?.id,
              status: 1,
              commenceTime: eventDataJson.commence_time,
              awayClubId: awayClub.id,
              homeClubId: homeClub.id,
              completed: 0,
              createdAt: now,
              updatedAt: now
            });
          } else {
            // Update existing event
            await this.eventsRepository.updateById(eventDataJson.id, {
              sportsGroupId: getSport?.sportsGroupId,
              sportId: getSport?.id,
              status: 1,
              commenceTime: eventDataJson.commence_time,
              awayClubId: awayClub.id,
              homeClubId: homeClub.id,
              updatedAt: now // Updated only
            });

            // Find the updated event to assign it to `newEvent`
            newEvent = await this.eventsRepository.findById(eventDataJson.id);
          }

          if (newEvent) {
            // Retrieve bookmakers from 'item'
            const bookmakers = eventDataJson.bookmakers;

            // Check if there are any bookmakers to process
            if (bookmakers.length > 0) {
              for (const itemBookmaker of bookmakers) {
                // Check if 'markets' are available
                if (itemBookmaker.markets.length > 0) {
                  const bookmakerKeyF = itemBookmaker.key;
                  const bookmakerTitleF = itemBookmaker.title.trim();

                  for (const market of itemBookmaker.markets) {

                    // Find existing odds based on event ID and market key
                    const findTheOdds = await this.oddsRepository.findOne({
                      where: {
                        eventId: newEvent.id,
                        bookmakerKey: bookmakerKeyF,
                        marketsKey: market.key,
                      },
                    });


                    // Check if odds already exist or if they need to be created/updated
                    if (!findTheOdds) {
                      // No odds found; create a new one
                      await this.oddsRepository.create({
                        eventId: newEvent.id,
                        bookmakerKey: bookmakerKeyF,
                        bookmakerTitle: bookmakerTitleF,
                        marketsKey: market.key,
                        oddsHomePoint: market.outcomes[0].point,
                        oddsAwayPoint: market.outcomes[1].point,
                        oddsHomePrice: market.outcomes[0].price,
                        oddsAwayPrice: market.outcomes[1].price,
                        createdAt: now, // Using current date/time
                        updatedAt: now,
                      });
                    } else {
                      // Odds found; update the existing record
                      await this.oddsRepository.updateById(findTheOdds.id, {
                        bookmakerKey: bookmakerKeyF,
                        bookmakerTitle: bookmakerTitleF,
                        marketsKey: market.key,
                        oddsHomePoint: market.outcomes[0].point,
                        oddsAwayPoint: market.outcomes[1].point,
                        oddsHomePrice: market.outcomes[0].price,
                        oddsAwayPrice: market.outcomes[1].price,
                        updatedAt: now, // Update timestamp
                      });
                    }
                  }
                }
              }
            }
          }
        }
      } else if (data.type == "scores") {
        for (const scoreJson of responseJson) {
          if (scoreJson.scores != null) {
            const eventId = scoreJson.id;
            const findEvent = this.eventsRepository.findOne({where: {id: eventId}});
            if (!findEvent) {
              //dont do nothing
            } else {
              const findScoreEvent = await this.scoresRepository.findOne({where: {eventId: eventId}});
              if (!findScoreEvent) {
                await this.scoresRepository.create({
                  eventId: eventId,
                  homeScore: scoreJson.scores[0].score,
                  awayScore: scoreJson.scores[1].score,
                  completed: scoreJson.completed,
                  createdAt: now,
                  updatedAt: now
                })
              } else {
                await this.scoresRepository.updateById(findScoreEvent.id, {
                  eventId: eventId,
                  homeScore: scoreJson.scores[0].score,
                  awayScore: scoreJson.scores[1].score,
                  completed: scoreJson.completed,
                  updatedAt: now
                })
              }
              if (scoreJson.completed) {
                const winner = (scoreJson.scores[0].score > scoreJson.scores[1].score) ? 1 : ((scoreJson.scores[0].score == scoreJson.scores[1].score) ? 3 : 2);
                await this.eventsRepository.updateById(eventId, {
                  completed: 1,
                  winner: winner,
                  updatedAt: now,
                })
              }
            }

          }
        }
      }
      return {"message": "success"};
    } catch (error) {
      console.log(error)
      throw new HttpErrors.InternalServerError(error.message);

    }



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
