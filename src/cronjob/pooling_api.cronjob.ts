import {Context} from '@loopback/core';
import axios, {AxiosInstance} from 'axios';
import cron from 'node-cron';

import EventsServices from '../services/pooling_services/events.services';
import ScoresServices from '../services/pooling_services/scores.services';
import SportsService from '../services/pooling_services/sports.services';

export class PoolingApiJob {
  private context: Context;
  private apiKey: String;
  private client: AxiosInstance;

  constructor(context: Context) {
    this.context = context;
    this.apiKey = process.env.API_KEY_SPORT || '6c651451bae293b8b865527583cc69a4';
    this.client = axios.create({
      baseURL: 'https://api.the-odds-api.com/v4/', // Base URL for your API
      timeout: 5000, // Set a request timeout
    });
    // this.getSports();
    // this.getMatchsEvents();
    this.getScores();
    cron.schedule('00 00 * * *', async () => {
      await this.getSports();
    }).start();
    cron.schedule('30 00 * * *', async () => {
      await this.getMatchsEvents();
    }).start();

    cron.schedule('*/15 * * * *', async () => {
      await this.getScores();
    }).start();
  }

  private async getMatchsEvents() {
    const eventsService = new EventsServices(this.context, this.client, this.apiKey);
    await eventsService.get();
  }
  private async getScores() {

    // var eventId = "0706cea87745fa1ed304206524d14164"
    // var data = [{
    //   "id": eventId,
    //   "sport_key": "basketball_nba",
    //   "sport_title": "NBA",
    //   "commence_time": "2022-02-06T03:10:38Z",
    //   "completed": true,
    //   "home_team": "Sacramento Kings",
    //   "away_team": "Oklahoma City Thunder",
    //   "scores": [
    //     {
    //       "name": "Sacramento Kings",
    //       "score": "205"
    //     },
    //     {
    //       "name": "Oklahoma City Thunder",
    //       "score": "203"
    //     }
    //   ],
    //   "last_update": "2022-02-06T05:18:19Z"
    // }];
    const scoresService = new ScoresServices(this.context, this.client, this.apiKey);
    await scoresService.get();

    // for (var i = 0; i <= 10; i++) {
    //   await scoresService.pool(Object.values(data)
    //     , eventId, "");
    // }
  }

  private async getSports() {
    const sportsService = new SportsService(this.context, this.client, this.apiKey);
    await sportsService.get();
  }

}
