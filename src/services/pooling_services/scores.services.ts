import {Context} from '@loopback/core';
import {AxiosInstance} from 'axios';
import {EventsRepository, PoolingRequestsRepository, ScoresRepository, UsersPredictionsRepository, UsersPredictionsSummariesAtsRepository, UsersPredictionsSummariesRepository} from '../../repositories';
class ScoresServices {
  private context: Context;
  private apiKey: String;
  private client: AxiosInstance;

  constructor(context: Context, client: AxiosInstance, apiKey: String) {
    this.context = context;
    this.apiKey = apiKey;
    this.client = client;
  }

  async get(): Promise<void> {
    console.log("EXECUTE GET SCORES");
    const poolingRequestRepository = await this.context.get<PoolingRequestsRepository>('repositories.PoolingRequestsRepository');
    const eventsRepository = await this.context.get<EventsRepository>('repositories.EventsRepository');
    const now = new Date();
    var newNow = new Date();
    newNow.setHours(newNow.getHours() - 6);
    console.log(now, newNow);
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
              responseMsg += await this.pool(responseData, event.id, responseMsg);
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

  async pool(responseData: any, eventID: string, responseMsg: string): Promise<string> {

    const scoresRepository = await this.context.get<ScoresRepository>('repositories.ScoresRepository');
    const eventsRepository = await this.context.get<EventsRepository>('repositories.EventsRepository');
    const usersPredictionsRepository = await this.context.get<UsersPredictionsRepository>('repositories.UsersPredictionsRepository');
    const usersPredSummaryRepo = await this.context.get<UsersPredictionsSummariesRepository>('repositories.UsersPredictionsSummariesRepository');
    const usersPredSummaryAtsRepo = await this.context.get<UsersPredictionsSummariesAtsRepository>('repositories.UsersPredictionsSummariesAtsRepository');
    const now = new Date();
    if (Array.isArray(responseData)) {
      for (const dataScore of responseData) {
        if (dataScore.scores != null) {
          if (dataScore.scores.length > 0) {
            const findScoreEvent = await scoresRepository.findOne({where: {eventId: eventID}});
            if (!findScoreEvent) {
              await scoresRepository.create({
                eventId: eventID,
                homeScore: dataScore.scores[0].score,
                awayScore: dataScore.scores[1].score,
                completed: dataScore.completed,
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
              })
              responseMsg += `SAVED NEW SCORE ${dataScore.home_team} VS ${dataScore.away_team}\n`;
            } else {
              await scoresRepository.updateById(findScoreEvent.id, {
                eventId: eventID,
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
              await eventsRepository.updateById(eventID, {
                completed: 1,
                winner: winnerStatus,
                updatedAt: now.toISOString(),
              });
              await usersPredictionsRepository.updateAll({predictedStatus: 1, updatedAt: now.toISOString()}, {
                eventId: eventID,
                predictedTeam: winnerStatus
              });
              await usersPredictionsRepository.updateAll({predictedStatus: 2, updatedAt: now.toISOString()}, {
                eventId: eventID,
                predictedTeam: {neq: winnerStatus}
              });
              const usersPredictsData = await usersPredictionsRepository.find({
                where: {
                  eventId: eventID
                }
              });
              if (usersPredictsData) {
                for (var userPrediction of usersPredictsData) {
                  var dateNow = new Date(userPrediction.createdAt!);
                  var month = dateNow.getMonth() + 1;
                  var predictedStatus = userPrediction.predictedStatus;
                  var uId = userPrediction.createdBy;
                  var getOneSummary = await usersPredSummaryRepo.findOne({
                    where: {
                      userId: uId,
                      month: month,
                      year: dateNow.getFullYear(),
                    }
                  });
                  if (getOneSummary) {
                    var updateStatusWinStreak = 1;
                    var updateStatusLoseStreak = 1;
                    var updateWinStreak = getOneSummary.winStreak;
                    var updateLongestWinStreak = getOneSummary.longestWinStreak;
                    var updateLoseStreak = getOneSummary.loseStreak;
                    var updateLongestLoseStreak = getOneSummary.longestLoseStreak;
                    var updateCorrect = getOneSummary.correct;
                    var updateIncorrect = getOneSummary.incorrect;
                    //CORRECT ANSWER
                    if (predictedStatus == 1) {
                      updateStatusWinStreak = 1;
                      updateStatusLoseStreak = 0;
                      updateCorrect = updateCorrect + 1;
                      if (getOneSummary.statusWinStreak == 1) {
                        updateWinStreak = updateWinStreak + 1;
                      } else {
                        updateWinStreak = 1;
                      }
                      if (updateWinStreak > updateLongestWinStreak) {
                        updateLongestWinStreak = updateLongestWinStreak + 1;
                      }

                    } else { //WRONG PREDICTION
                      updateStatusWinStreak = 0;
                      updateStatusLoseStreak = 1;
                      updateIncorrect = updateIncorrect + 1;
                      if (getOneSummary.statusLoseStreak == 1) {
                        updateLoseStreak = updateLoseStreak + 1;
                      } else {
                        updateLoseStreak = 1;
                      }

                      if (updateLoseStreak >= updateLongestLoseStreak) {
                        updateLongestLoseStreak = updateLongestLoseStreak + 1;
                      }
                    }
                    await usersPredSummaryRepo.updateById(getOneSummary.id, {
                      winStreak: updateWinStreak,
                      loseStreak: updateLoseStreak,
                      longestWinStreak: updateLongestWinStreak,
                      longestLoseStreak: updateLongestLoseStreak,
                      correct: updateCorrect,
                      incorrect: updateIncorrect,
                      statusLoseStreak: updateStatusLoseStreak,
                      statusWinStreak: updateStatusWinStreak,
                    });
                  }

                  var getOneSummaryAts = await usersPredSummaryAtsRepo.findOne({
                    where: {
                      userId: uId,
                    }
                  });
                  if (getOneSummaryAts) {
                    var updateStatusWinStreak = 1;
                    var updateStatusLoseStreak = 1;
                    var updateWinStreak = getOneSummaryAts.winStreak;
                    var updateLongestWinStreak = getOneSummaryAts.longestWinStreak;
                    var updateLoseStreak = getOneSummaryAts.loseStreak;
                    var updateLongestLoseStreak = getOneSummaryAts.longestLoseStreak;
                    var updateCorrect = getOneSummaryAts.correct;
                    var updateIncorrect = getOneSummaryAts.incorrect;
                    //CORRECT ANSWER
                    if (predictedStatus == 1) {
                      updateStatusWinStreak = 1;
                      updateStatusLoseStreak = 0;
                      updateCorrect = updateCorrect + 1;
                      if (getOneSummaryAts.statusWinStreak == 1) {
                        updateWinStreak = updateWinStreak + 1;
                      } else {
                        updateWinStreak = 1;
                      }
                      if (updateWinStreak > updateLongestWinStreak) {
                        updateLongestWinStreak = updateLongestWinStreak + 1;
                      }

                    } else { //WRONG PREDICTION
                      updateStatusWinStreak = 0;
                      updateStatusLoseStreak = 1;
                      updateIncorrect = updateIncorrect + 1;
                      if (getOneSummaryAts.statusLoseStreak == 1) {
                        updateLoseStreak = updateLoseStreak + 1;
                      } else {
                        updateLoseStreak = 1;
                      }

                      if (updateLoseStreak >= updateLongestLoseStreak) {
                        updateLongestLoseStreak = updateLongestLoseStreak + 1;
                      }
                    }
                    await usersPredSummaryAtsRepo.updateById(getOneSummaryAts.id, {
                      winStreak: updateWinStreak,
                      loseStreak: updateLoseStreak,
                      longestWinStreak: updateLongestWinStreak,
                      longestLoseStreak: updateLongestLoseStreak,
                      correct: updateCorrect,
                      incorrect: updateIncorrect,
                      statusLoseStreak: updateStatusLoseStreak,
                      statusWinStreak: updateStatusWinStreak,
                    });
                  }
                }
              }
              responseMsg += `UPDATED USER PREDICTIONS EVENT ${dataScore.home_team} VS ${dataScore.away_team} \n `;
            }
          } else {
            responseMsg += "RESULT SCORE EMPTY\n";
          }
        }
      }
    }

    return responseMsg;
  }
}

export default ScoresServices
