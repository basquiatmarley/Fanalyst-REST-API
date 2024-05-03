import {Context} from '@loopback/core';
import axios, {AxiosInstance} from 'axios';
import cron from 'node-cron';

import {Events} from '../models/events.model';
import {ClubsRepository, EventsRepository, OddsRepository, PoolingRequestsRepository, ScoresRepository, SportsGroupsRepository, SportsRepository, UsersPredictionsRepository} from '../repositories';

export class PoolingApiJob {
  private context: Context;
  private apiKey: String;
  private client: AxiosInstance;

  constructor(context: Context) {
    this.context = context;
    this.apiKey = process.env.API_KEY_SPORT || 'f7908319c61839eca4f6a86320b70f80';
    this.client = axios.create({
      baseURL: 'https://api.the-odds-api.com/v4/', // Base URL for your API
      timeout: 5000, // Set a request timeout
    });
    this.getSports();
    this.getMatchsEvents();
    this.getScores();
    cron.schedule('00 00 * * *', async () => {
      await this.getSports();
    }).start();
    cron.schedule('30 00 * * *', async () => {
      await this.getMatchsEvents();
    }).start();

    cron.schedule('15 * * * *', async () => {
      await this.getScores();
    }).start();
  }

  private async getMatchsEvents() {
    console.log("POOLING GET MATCH EVENTS");
    const sportsRepository = await this.context.get<SportsRepository>('repositories.SportsRepository');
    const poolingRequestRepository = await this.context.get<PoolingRequestsRepository>('repositories.PoolingRequestsRepository');
    const clubsRepository = await this.context.get<ClubsRepository>('repositories.ClubsRepository');
    const eventsRepository = await this.context.get<EventsRepository>('repositories.EventsRepository');
    const oddsRepository = await this.context.get<OddsRepository>('repositories.OddsRepository');
    const sportsList = await sportsRepository.find({
      // "limit": 2,
      "where": {
        // "key": {nlike: "%winner"},
        // "id": 68,
        "status": 1
      },
      "include": [
        {
          "relation": "sportsGroup",
          "required": true,
          "scope": {
            "where": {
              "status": 1,
              // "id": 13
            }
          }
        }
      ]
    });
    // console.log(sportsList);
    const now = new Date().toISOString();
    if (Array.isArray(sportsList)) {
      for (const sport of sportsList) {
        var url = `sports/${sport.key}/odds?apiKey=${this.apiKey}&regions=us,uk&markets=spreads&dateFormat=iso&oddsFormat=decimal`;

        var poolingDataSaved = await poolingRequestRepository.create({
          urlRequest: url,
          type: "events",
        });
        var responseMsg = "";
        try {
          var response = await this.client.get(url);
          if (response.status == 200) {
            if (response.data.length > 0) {
              var responseData = response.data;
              if (Array.isArray(responseData)) {
                for (const eventDataJson of responseData) {
                  const filter = {where: {key: eventDataJson.sport_key.trim()}};
                  const getSport = await sportsRepository.findOne(filter);
                  if (eventDataJson.home_team != null && eventDataJson.away_team != null) {
                    let homeClubName = eventDataJson.home_team.trim();
                    let awayClubName = eventDataJson.away_team.trim();
                    let homeClub = await clubsRepository.findOne({where: {name: homeClubName}});
                    if (!homeClub) {
                      homeClub = await clubsRepository.create({
                        sportsGroupId: getSport?.sportsGroupId,
                        name: eventDataJson.home_team.trim(),
                        status: 1,
                        imageUrl: "",
                        createdAt: now,
                        updatedAt: now
                      });
                      responseMsg += `SAVED NEW CLUB ${eventDataJson.home_team}\n`;
                    }
                    let awayClub = await clubsRepository.findOne({where: {name: awayClubName}});
                    if (!awayClub) {
                      awayClub = await clubsRepository.create({
                        sportsGroupId: getSport?.sportsGroupId,
                        name: eventDataJson.away_team.trim(),
                        status: 1,
                        imageUrl: "",
                        createdAt: now,
                        updatedAt: now
                      });
                      responseMsg += `SAVED AWAY CLUB ${eventDataJson.away_team}\n`;
                    }
                    const existEventData = await eventsRepository.findOne({where: {id: eventDataJson.id}});
                    let newEvent: Events;
                    const commenceTime = eventDataJson.commence_time;

                    // Parse commence_time into a JavaScript Date object
                    const parsedDate = new Date(commenceTime);
                    const formatedCommencTIme = parsedDate.toUTCString();
                    if (!existEventData) {
                      // Create new event
                      newEvent = await eventsRepository.create({
                        id: eventDataJson.id,
                        sportsGroupId: getSport?.sportsGroupId,
                        sportId: getSport?.id,
                        status: 1,
                        commenceTime: formatedCommencTIme,
                        awayClubId: awayClub.id,
                        homeClubId: homeClub.id,
                        completed: 0,
                        createdAt: now,
                        updatedAt: now
                      });
                      responseMsg += `SAVED NEW EVENT ${eventDataJson.id}\n`;
                    } else {
                      // Update existing event
                      await eventsRepository.updateById(eventDataJson.id, {
                        status: 1,
                        commenceTime: formatedCommencTIme,
                        awayClubId: awayClub.id,
                        homeClubId: homeClub.id,
                        updatedAt: now // Updated only
                      });
                      responseMsg += `UPDATE NEW EVENT ${eventDataJson.id}\n`;
                      // Find the updated event to assign it to `newEvent`
                      newEvent = await eventsRepository.findById(eventDataJson.id);
                    }

                    if (newEvent) {
                      // Retrieve bookmakers from 'item'
                      if (eventDataJson.bookmakers != undefined) {
                        const bookmakers = eventDataJson.bookmakers;

                        // Check if there are any bookmakers to process
                        if (bookmakers.length > 0) {
                          for (const itemBookmaker of bookmakers) {
                            // Check if 'markets' are available
                            if (itemBookmaker.markets.length > 0) {
                              const bookmakerKeyF = itemBookmaker.key;
                              const bookmakerTitleF = itemBookmaker.title.trim();

                              for (const market of itemBookmaker.markets) {
                                let mOddsHomePoint = 0;
                                let mOddsAwayPoint = 0;
                                let mOddsHomePrice = 0;
                                let mOddsAwayPrice = 0;
                                if (homeClubName == market.outcomes[0].name.trim()) {
                                  mOddsHomePoint = market.outcomes[0].point;
                                  mOddsAwayPoint = market.outcomes[1].point;
                                  mOddsHomePrice = market.outcomes[0].price;
                                  mOddsAwayPrice = market.outcomes[1].price;
                                } else {
                                  mOddsHomePoint = market.outcomes[0].point;
                                  mOddsAwayPoint = market.outcomes[1].point;
                                  mOddsHomePrice = market.outcomes[0].price;
                                  mOddsAwayPrice = market.outcomes[1].price;
                                }
                                // Find existing odds based on event ID and market key
                                const findTheOdds = await oddsRepository.findOne({
                                  where: {
                                    eventId: newEvent.id,
                                    bookmakerKey: bookmakerKeyF,
                                    marketsKey: market.key,
                                  },
                                });


                                // Check if odds already exist or if they need to be created/updated
                                if (!findTheOdds) {
                                  // No odds found; create a new one
                                  await oddsRepository.create({
                                    eventId: newEvent.id,
                                    bookmakerKey: bookmakerKeyF,
                                    bookmakerTitle: bookmakerTitleF,
                                    marketsKey: market.key,
                                    oddsHomePoint: mOddsHomePoint,
                                    oddsAwayPoint: mOddsAwayPoint,
                                    oddsHomePrice: mOddsHomePrice,
                                    oddsAwayPrice: mOddsAwayPrice,
                                    createdAt: now, // Using current date/time
                                    updatedAt: now,
                                  });
                                } else {
                                  // Odds found; update the existing record
                                  await oddsRepository.updateById(findTheOdds.id, {
                                    bookmakerKey: bookmakerKeyF,
                                    bookmakerTitle: bookmakerTitleF,
                                    marketsKey: market.key,
                                    oddsHomePoint: mOddsHomePoint,
                                    oddsAwayPoint: mOddsAwayPoint,
                                    oddsHomePrice: mOddsHomePrice,
                                    oddsAwayPrice: mOddsAwayPrice,
                                    updatedAt: now, // Update timestamp
                                  });
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    responseMsg += "EVENT SKIP - CLUB TEAM NOT ADDED YET";
                  }

                }
              }
            } else {
              responseMsg = "RESULT POOLING EMPTY\n";
            }
          } else {
            responseMsg = "GET REQUEST ERROR";
          }
        } catch (e) {
          // console.log(e.response);
          if (e.response) {
            responseMsg += "Error status: " + e + '\n';
            responseMsg += "Error data: " + e.response.data.message + '\n';
          } else {
            responseMsg += e + '\n';
          }

          // responseMsg += e.data.message;

        }

        await poolingRequestRepository.updateById(poolingDataSaved.id, {response: responseMsg});
      }
    } else {
      console.error('sportsList is not an array or is empty.');
    }
  }
  private async getScores() {
    console.log("EXECUTE GET SCORES");
    const poolingRequestRepository = await this.context.get<PoolingRequestsRepository>('repositories.PoolingRequestsRepository');
    const scoresRepository = await this.context.get<ScoresRepository>('repositories.ScoresRepository');
    const eventsRepository = await this.context.get<EventsRepository>('repositories.EventsRepository');
    const usersPredictionsRepository = await this.context.get<UsersPredictionsRepository>('repositories.UsersPredictionsRepository');
    const now = new Date();
    var newNow = new Date();
    newNow.setHours(newNow.getHours() - 2);


    const events = await eventsRepository.find({
      // "limit": 30,
      "where": {
        "commenceTime": {lt: now, gt: newNow},
        "completed": 0
      },
      "include": [
        {
          "relation": "sport",
          "required": true,
          "scope": {
            "where": {
              "status": 1,
              // "key": "soccer_korea_kleague1"
            }
          }
        }
      ]
    });
    if (Array.isArray(events)) {
      for (const event of events) {
        var url = `sports/${event.sport.key}/scores?apiKey=${this.apiKey}&daysFrom=2&dateFormat=iso&eventIds=${event.id}`;
        console.log(url);
        var poolingDataSaved = await poolingRequestRepository.create({
          urlRequest: url,
          type: "scores",
        });
        var responseMsg = "";
        try {
          var response = await this.client.get(url);
          if (response.status == 200) {
            if (response.data.length > 0) {
              var responseData = response.data;
              if (Array.isArray(responseData)) {
                for (const dataScore of responseData) {
                  console.log(dataScore);
                  if (dataScore.scores != null) {
                    if (dataScore.scores.length > 0) {
                      const findScoreEvent = await scoresRepository.findOne({where: {eventId: event.id}});
                      if (!findScoreEvent) {
                        await scoresRepository.create({
                          eventId: event.id,
                          homeScore: dataScore.scores[0].score,
                          awayScore: dataScore.scores[1].score,
                          completed: dataScore.completed,
                          createdAt: now.toISOString(),
                          updatedAt: now.toISOString()
                        })
                        responseMsg += `SAVED NEW SCORE ${dataScore.home_team} VS ${dataScore.away_teamn}\n`;
                      } else {
                        await scoresRepository.updateById(findScoreEvent.id, {
                          eventId: event.id,
                          homeScore: dataScore.scores[0].score,
                          awayScore: dataScore.scores[1].score,
                          completed: dataScore.completed,
                          updatedAt: now.toISOString()
                        })
                        responseMsg += `UPDATED SCORE ${dataScore.home_team} VS ${dataScore.away_team} \n `;
                      }
                      // dataScore.completed = true;
                      if (dataScore.completed) {
                        const winnerStatus = (dataScore.scores[0].score > dataScore.scores[1].score) ? 1 : ((dataScore.scores[0].score == dataScore.scores[1].score) ? 3 : 2);
                        responseMsg += `UPDATED MATCH EVENT COMPLETE ${dataScore.home_team} VS ${dataScore.away_team} \n `;
                        await eventsRepository.updateById(event.id, {
                          completed: 1,
                          winner: winnerStatus,
                          updatedAt: now.toISOString(),
                        });
                        usersPredictionsRepository.updateAll({predictedStatus: 1, updatedAt: now.toISOString()}, {
                          eventId: event.id,
                          predictedTeam: winnerStatus
                        });
                        usersPredictionsRepository.updateAll({predictedStatus: 2, updatedAt: now.toISOString()}, {
                          eventId: event.id,
                          predictedTeam: {neq: winnerStatus}
                        });
                        responseMsg += `UPDATED USER PREDICTIONS EVENT ${dataScore.home_team} VS ${dataScore.away_team} \n `;
                      }
                    } else {
                      responseMsg += "RESULT SCORE EMPTY\n";
                    }
                  }

                }
              }
            } else {
              responseMsg += "RESULT POOLING EMPTY\n";
              await eventsRepository.updateById(event.id, {
                completed: 1,
                updatedAt: now.toISOString(),
              });
            }
          } else {
            responseMsg += "GET REQUEST ERROR";
          }
        } catch (e) {
          // console.log(e.response);
          if (e.response) {
            responseMsg += "Error status: " + e + '\n';
            responseMsg += "Error data: " + e.response.data.message + '\n';
          } else {
            responseMsg += e + '\n';
          }

          // responseMsg += e.data.message;

        }
        await poolingRequestRepository.updateById(poolingDataSaved.id, {response: responseMsg});
      }
    } else {
      console.error('events is not an array or is empty.');
    }
  }

  private async getSports() {
    console.log("EXECUTE GET Sports");
    const poolingRequestRepository = await this.context.get<PoolingRequestsRepository>('repositories.PoolingRequestsRepository');
    const sportsGroupsRepository = await this.context.get<SportsGroupsRepository>('repositories.SportsGroupsRepository');
    const sportsRepository = await this.context.get<SportsRepository>('repositories.SportsRepository');
    const now = new Date().toISOString();

    var url = `sports?apiKey=${this.apiKey}&all=true`;
    var poolingDataSaved = await poolingRequestRepository.create({
      urlRequest: url,
      type: "sports",
    });
    var responseMsg = "";
    try {
      var response = await this.client.get(url);
      if (response.status == 200) {
        if (response.data.length > 0) {
          var responseData = response.data;
          if (Array.isArray(responseData)) {
            for (const dataSport of responseData) {
              var getSportsGroup = await sportsGroupsRepository.findOne({where: {title: dataSport.key.trim()}});
              if (getSportsGroup) {
                const dataSaved = {
                  title: dataSport.key.trim(),
                  statusHotest: 1,
                  status: 1,
                  imageUrl: "",
                  createdAt: now,
                  updatedAt: now
                }
                getSportsGroup = await sportsGroupsRepository.create(dataSaved);
              }
              const getSport = await sportsRepository.findOne({where: {key: dataSport.key.trim()}});
              if (!getSport) {
                const dataSaved = {
                  sportsGroupId: getSportsGroup?.id,
                  title: dataSport.title.trim(),
                  status: dataSport.active,
                  key: dataSport.key.trim(),
                  imageUrl: "",
                  createdAt: now,
                  updatedAt: now
                }
                await sportsRepository.create(dataSaved);
                responseMsg += `NEW SAVED SPORT : ${dataSport.title}\n`;
              } else {
                const dataSaved = {
                  sportsGroupId: getSportsGroup?.id,
                  title: dataSport.title.trim(),
                  status: dataSport.active,
                  key: dataSport.key.trim(),
                  updatedAt: now
                }
                await sportsRepository.updateById(getSport.id, dataSaved);
                responseMsg += `UPDATE SPORT : ${dataSport.title}\n`;
              }
            }
          }
        } else {
          responseMsg = "RESULT POOLING EMPTY\n";
        }
      } else {
        responseMsg = "GET REQUEST ERROR";
      }
    } catch (e) {
      // console.log(e.response);
      if (e.response) {
        responseMsg += "Error status: " + e + '\n';
        responseMsg += "Error data: " + e.response.data.message + '\n';
      } else {
        responseMsg += e + '\n';
      }

      // responseMsg += e.data.message;

    }
    await poolingRequestRepository.updateById(poolingDataSaved.id, {response: responseMsg});
  }
}
