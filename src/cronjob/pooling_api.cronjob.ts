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
    this.getSports();
    // this.getMatchsEvents();
    // this.getScores();
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
    const scoresService = new ScoresServices(this.context, this.client, this.apiKey);
    await scoresService.get();
  }

  private async getSports() {
    const sportsService = new SportsService(this.context, this.client, this.apiKey);
    await sportsService.get();
  }
}
