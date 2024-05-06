import {repository} from '@loopback/repository';
import {UsersNotifications} from '../models';
import {UsersCommentsRepository, UsersNotificationsRepository, UsersPredictionsRepository} from '../repositories';

export class NotificationService {
  constructor(
    @repository(UsersNotificationsRepository)
    private usersNotificationsRepo: UsersNotificationsRepository,
    @repository(UsersCommentsRepository)
    public usersCommentsRepository: UsersCommentsRepository,
    @repository(UsersPredictionsRepository)
    public usersPredictionRepository: UsersPredictionsRepository,
  ) { }

  async create(
    userId: number,
    refKey: number,
    ntype: number,
    message?: string,
  ): Promise<UsersNotifications> {
    const saved = await this.createSimpleNotification(userId, refKey, ntype, message);
    ///SEND NOTIFICATION EX:FIREBASE-EMAIl-WHATSAPP//
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
      createdAt: new Date().toISOString(),
    });
  }

  async getNotificationDetail(notifications: UsersNotifications[]) {
    const notificationsDetails: any[] = [];
    for (const notification of notifications) {
      var detail: any;
      if (notification.ntype == 1) {
        const getComment = await this.usersCommentsRepository.findById(notification.refKey, {
          include: [{relation: 'userCreated', required: true}],
        });
        detail = {
          "from": getComment.userCreated!.firstName,
          "message": getComment.title,
          "route": `${getComment.id}`
        };
      } else if (notification.ntype == 4) {
        const getPrediction = await this.usersPredictionRepository.findById(notification.refKey, {
          include: [
            {
              relation: 'event',
              required: true,
              scope: {
                include: [
                  {"relation": "homeClub"},
                  {"relation": "awayClub"},
                ]
              }
            }
          ]
        });
        const event = getPrediction.event;
        detail = {
          "message": notification.message,
          "desc": event.homeClub.name + " VS " + event.awayClub.name,
          "route": `${getPrediction.eventId}`
        }
      } else {
        const getPrediction = await this.usersPredictionRepository.findById(notification.refKey, {
          include: [
            {
              relation: 'event',
              required: true,
              scope: {
                include: [
                  {"relation": "homeClub"},
                  {"relation": "awayClub"},
                ]
              }
            }
          ]
        });
        const event = getPrediction.event;
        detail = {
          "message": getPrediction.predictedStatus == 1 ? "CORRECT" : "INCORRECT",
          "desc": event.homeClub.name + " VS " + event.awayClub.name,
          "route": `${getPrediction.eventId}`
        }
      }

      notificationsDetails.push(detail);
    }
    return notificationsDetails;
  }
}
