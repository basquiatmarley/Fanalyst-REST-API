import {Context} from '@loopback/core';
import axios, {AxiosInstance} from 'axios';
import cron from 'node-cron';

import {Events} from '../models/events.model';
import {ClubsRepository, EventsRepository, OddsRepository, PoolingRequestsRepository, SportsRepository} from '../repositories';

export class PoolingApiJob {
  private context: Context;
  private apiKey: String;
  private client: AxiosInstance;

  constructor(context: Context) {
    this.context = context;
    this.apiKey = '39b5dd2bc8dc38dbec2de21203b28fd0';
    this.client = axios.create({
      baseURL: 'https://api.the-odds-api.com/v4/', // Base URL for your API
      timeout: 5000, // Set a request timeout
    });
    this.getMatchsEvents();
    cron.schedule('00 00 * * *', async () => {
      await this.getMatchsEvents();
    }).start();
  }

  private async getMatchsEvents() {
    console.log("EXECUTE GET MATCH");
    const sportsRepository = await this.context.get<SportsRepository>('repositories.SportsRepository');
    const poolingRequestRepository = await this.context.get<PoolingRequestsRepository>('repositories.PoolingRequestsRepository');
    const clubsRepository = await this.context.get<ClubsRepository>('repositories.ClubsRepository');
    const eventsRepository = await this.context.get<EventsRepository>('repositories.EventsRepository');
    const oddsRepository = await this.context.get<OddsRepository>('repositories.OddsRepository');
    const sportsList = await sportsRepository.find({
      // "limit": 2,
      "where": {
        "key": "americanfootball_ncaaf_championship_winner",
        "status": 1
      },
      "include": [
        {
          "relation": "sportsGroup",
          "required": true,
          "scope": {
            "where": {
              "status": 1
            }
          }
        }
      ]
    });
    const now = new Date().toISOString();
    if (Array.isArray(sportsList)) {
      for (const sport of sportsList) {
        var url = `sports/${sport.key}/odds?apiKey=${this.apiKey}&regions=us,uk&markets=spreads&dateFormat=iso&oddsFormat=decimal`;
        console.log(url);
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
}
