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
    this.apiKey = process.env.API_KEY_SPORT || 'f7908319c61839eca4f6a86320b70f80';
    this.client = axios.create({
      baseURL: 'https://api.the-odds-api.com/v4/', // Base URL for your API
      timeout: 5000, // Set a request timeout
    });
    // this.getSports();c
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
    // const data = [{
    //   "id": "011e589a2f2d3a6915bb994823cfab01",
    //   "sport_key": "basketball_nba",
    //   "sport_title": "NBA",
    //   "commence_time": "2022-02-06T03:10:38Z",
    //   "completed": true,
    //   "home_team": "Sacramento Kings",
    //   "away_team": "Oklahoma City Thunder",
    //   "scores": [
    //     {
    //       "name": "Sacramento Kings",
    //       "score": "113"
    //     },
    //     {
    //       "name": "Oklahoma City Thunder",
    //       "score": "150"
    //     }
    //   ],
    //   "last_update": "2022-02-06T05:18:19Z"
    // }];
    const scoresService = new ScoresServices(this.context, this.client, this.apiKey);
    // await scoresService.pool(Object.values(data)
    //   , "15e368c19612da85f203a95384a7205d", "");
    await scoresService.get();
  }

  private async getSports() {
    const sportsService = new SportsService(this.context, this.client, this.apiKey);
    await sportsService.get();
  }

}
