import {injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as admin from 'firebase-admin';
import * as path from 'path';
import {UsersNotifications} from '../models';
import {UsersFcmTokensRepository} from '../repositories';

@injectable()
export class FirebaseAdminService {
  constructor(
    @repository(UsersFcmTokensRepository)
    private usersFcmRepo: UsersFcmTokensRepository,
  ) {
    const serviceAccountPath = path.resolve(__dirname, '../../src/config/serviceAccountKey.json');
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
    }
  }

  async prepareMessageNotification(notification: UsersNotifications, detail: any) {
    var title = "";
    var message = "";
    var deepLink = "";
    var idLink = "";
    if (notification.ntype == 1) {
      title = detail.from + " Reply Your Comment";
      message = detail.message;
      deepLink = "/match-comments/" + detail.route;
    } else if (notification.ntype == 2 || notification.ntype == 3) {
      title = "Prediction Update's";
      message = "[" + detail.desc + "] Your prediction is: " + detail.message;
      deepLink = "/match-detail/" + detail.route;
    } else {
      title = "Streak Update's";
      message = "You got " + detail.message + " Streaks from Match Pick! ";
      deepLink = "/match-detail/" + detail.route;
    }
    return {
      title, message, additionalData: {deepLink, idLink}
    };
  }

  async send(notification: UsersNotifications, detail: any) {
    const messageData = await this.prepareMessageNotification(notification, detail);

    const getUsersFcmTokens = await this.usersFcmRepo.find({
      where: {
        userId: notification.userId,
        status: 1,
      }
    });
    let token = [];
    for (const userFcmToken of getUsersFcmTokens) {
      token.push(userFcmToken.token);
    }
    console.log(token);
    await this.execute(
      token,
      messageData.title,
      messageData.message, messageData.additionalData
    );
  }

  async execute(
    token: string[], //array token fcm
    title: string,
    body: string,
    additionalData: {[key: string]: string} = {},
  ): Promise<void> {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      tokens: token,
      data: additionalData,
    };

    try {
      var response = await admin.messaging().sendEachForMulticast(message);
      console.log('Notification sent successfully');
      console.log(response.responses);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}
