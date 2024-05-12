import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UsersNotifications} from '../models';
import {
  UsersCommentsRepository,
  UsersNotificationsRepository,
  UsersPredictionsRepository,
} from '../repositories';
import {FirebaseAdminService} from './fcm.service';

export class NotificationService {
  constructor(
    @repository(UsersNotificationsRepository)
    private usersNotificationsRepo: UsersNotificationsRepository,
    @repository(UsersCommentsRepository)
    public usersCommentsRepository: UsersCommentsRepository,
    @repository(UsersPredictionsRepository)
    public usersPredictionRepository: UsersPredictionsRepository,
    @inject('services.FirebaseAdminService')
    private firebaseAdminService: FirebaseAdminService,
  ) {}

  async create(
    userId: number,
    refKey: number,
    ntype: number,
    message?: string,
  ): Promise<UsersNotifications> {
    const saved = await this.createSimpleNotification(
      userId,
      refKey,
      ntype,
      message,
    );
    ///SEND NOTIFICATION EX:FIREBASE-EMAIl-WHATSAPP//
    const detail = await this.getDetailNotification(saved);
    await this.firebaseAdminService.send(saved, detail);
    return saved;
  }

  async createSimpleNotification(
    userId: number,
    refKey: number,
    type: number,
    message?: string,
  ): Promise<UsersNotifications> {
    return this.usersNotificationsRepo.create({
      userId, // Verify correct name and type
      refKey,
      ntype: type,
      message: message,
    });
  }

  async getNotificationDetail(notifications: UsersNotifications[]) {
    const notificationsDetails: any[] = [];
    if (notifications.length > 0) {
      for (const notification of notifications) {
        var detail = await this.getDetailNotification(notification);
        notificationsDetails.push(detail);
      }
    }

    return notificationsDetails;
  }

  async getDetailNotification(notification: UsersNotifications) {
    var detail: object = {};
    if (notification.ntype == 1) {
      const getComment = await this.usersCommentsRepository.findById(
        notification.refKey,
        {
          include: [{relation: 'userCreated', required: true}],
        },
      );
      detail = {
        from: getComment.userCreated!.firstName,
        message: getComment.title,
        route: `${getComment.parentId}`,
      };
    } else if (notification.ntype == 4) {
      const getPrediction = await this.usersPredictionRepository.findById(
        notification.refKey,
        {
          include: [
            {
              relation: 'event',
              required: true,
              scope: {
                include: [{relation: 'homeClub'}, {relation: 'awayClub'}],
              },
            },
          ],
        },
      );
      const event = getPrediction.event;
      detail = {
        message: notification.message,
        desc: event.homeClub.name + ' VS ' + event.awayClub.name,
        route: `${getPrediction.eventId}`,
      };
    } else {
      const getPrediction = await this.usersPredictionRepository.findById(
        notification.refKey,
        {
          include: [
            {
              relation: 'event',
              required: true,
              scope: {
                include: [{relation: 'homeClub'}, {relation: 'awayClub'}],
              },
            },
          ],
        },
      );
      const event = getPrediction.event;
      detail = {
        message: getPrediction.predictedStatus == 1 ? 'CORRECT' : 'INCORRECT',
        desc: event.homeClub.name + ' VS ' + event.awayClub.name,
        route: `${getPrediction.eventId}`,
      };
    }
    return detail;
  }
}
