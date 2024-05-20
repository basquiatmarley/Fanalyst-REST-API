import {Context} from '@loopback/core';
import axios, {AxiosInstance} from 'axios';

import cron from 'node-cron';
import ClubsService from '../services/pooling_services/club.services';
import EventsServices from '../services/pooling_services/events.services';
import FcmUpdateService from '../services/pooling_services/fcm_update.services';
import ScoresServices from '../services/pooling_services/scores.services';
import SportsService from '../services/pooling_services/sports.services';
export class PoolingApiJob {
  private context: Context;
  private apiKey: String;
  private client: AxiosInstance;

  constructor(context: Context) {
    this.context = context;
    this.apiKey =
      process.env.API_KEY_SPORT || '6c651451bdssae32293b8b865527583cc69a4';
    this.client = axios.create({
      baseURL: 'https://api.the-odds-api.com/v4/', // Base URL for your API
      timeout: 5000, // Set a request timeout
    });

    // this.clubsUpdateImage();
    // this.getScores();
    // this.getMatchsEvents();
    // this.getScoresDumy();
    // this.updateUnusedFcm();
    cron
      .schedule('00 00 * * *', async () => {
        await this.getSports();
      })
      .start();
    cron
      .schedule('40 * * * *', async () => {
        await this.clubsUpdateImage();
      })
      .start();
    cron
      .schedule('30 00 * * *', async () => {
        await this.getMatchsEvents();
      })
      .start();

    cron
      .schedule('*/30 * * * *', async () => {
        await this.getScores();
      })
      .start();
    cron
      .schedule('50 * * * *', async () => {
        await this.updateUnusedFcm();
      })
      .start();
  }

  private async getMatchsEvents() {
    const eventsService = new EventsServices(
      this.context,
      this.client,
      this.apiKey,
    );
    await eventsService.get();
  }
  private async getScores() {
    const scoresService = new ScoresServices(
      this.context,
      this.client,
      this.apiKey,
    );
    await scoresService.get();
  }

  private async getSports() {
    const sportsService = new SportsService(
      this.context,
      this.client,
      this.apiKey,
    );
    await sportsService.get();
  }

  private async getScoresDumy() {
    var eventId = '0bd8a1c7bef8bd8c4cf0696d504220a8';
    var data = [
      {
        id: eventId,
        sport_key: 'basketball_nba',
        sport_title: 'NBA',
        commence_time: '2022-02-06T03:10:38Z',
        completed: true,
        home_team: 'Sacramento Kings',
        away_team: 'Oklahoma City Thunder',
        scores: [
          {
            name: 'Sacramento Kings',
            score: '205',
          },
          {
            name: 'Oklahoma City Thunder',
            score: '208',
          },
        ],
        last_update: '2022-02-06T05:18:19Z',
      },
    ];
    const scoresService = new ScoresServices(
      this.context,
      this.client,
      this.apiKey,
    );
    for (var i = 0; i <= 10; i++) {
      console.log(`POOLING DATA : ${i}`);
      await scoresService.pool(Object.values(data), eventId, '');
    }
  }

  private async clubsUpdateImage() {
    const clubService = new ClubsService(
      this.context,
    );
    await clubService.get();
  }

  private async updateUnusedFcm() {
    const fcmUpdateService = new FcmUpdateService(
      this.context,
    );
    await fcmUpdateService.get();
  }
}
