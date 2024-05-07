import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {UsersNotifications} from '../models';
import {UsersNotificationsRepository} from '../repositories';
import {NotificationService} from '../services';

export class UsersNotificationsController {
  constructor(
    @repository(UsersNotificationsRepository)
    public usersNotificationsRepository: UsersNotificationsRepository,
    @inject('services.NotificationService') private notificationService: NotificationService,
  ) { }

  @post('/users-notifications')
  @response(200, {
    description: 'UsersNotifications model instance',
    content: {'application/json': {schema: getModelSchemaRef(UsersNotifications)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersNotifications, {
            title: 'NewUsersNotifications',
            exclude: ['id'],
          }),
        },
      },
    })
    usersNotifications: Omit<UsersNotifications, 'id'>,
  ): Promise<UsersNotifications> {
    return this.usersNotificationsRepository.create(usersNotifications);
  }

  @get('/users-notifications/count')
  @response(200, {
    description: 'UsersNotifications model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UsersNotifications) where?: Where<UsersNotifications>,
  ): Promise<Count> {
    return this.usersNotificationsRepository.count(where);
  }

  @get('/users-notifications')
  @response(200, {
    description: 'Array of UsersNotifications model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UsersNotifications, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UsersNotifications) filter?: Filter<UsersNotifications>,
  ): Promise<{notifications: UsersNotifications[] | [], notificationsDetails: any[] | []}> {

    const notifications = await this.usersNotificationsRepository.find(filter);

    let notificationsDetails = [];
    if (notifications.length > 0) {
      notificationsDetails = await this.notificationService.getNotificationDetail(notifications);
    } else {
      notificationsDetails = [];
    }

    return {
      notifications: notifications,
      notificationsDetails: notificationsDetails,
    };
  }

  @patch('/users-notifications')
  @response(200, {
    description: 'UsersNotifications PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersNotifications, {partial: true}),
        },
      },
    })
    usersNotifications: UsersNotifications,
    @param.where(UsersNotifications) where?: Where<UsersNotifications>,
  ): Promise<Count> {
    return this.usersNotificationsRepository.updateAll(usersNotifications, where);
  }

  @get('/users-notifications/{id}')
  @response(200, {
    description: 'UsersNotifications model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UsersNotifications, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UsersNotifications, {exclude: 'where'}) filter?: FilterExcludingWhere<UsersNotifications>
  ): Promise<UsersNotifications> {
    return this.usersNotificationsRepository.findById(id, filter);
  }

  @patch('/users-notifications/{id}')
  @response(204, {
    description: 'UsersNotifications PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsersNotifications, {partial: true}),
        },
      },
    })
    usersNotifications: UsersNotifications,
  ): Promise<void> {
    await this.usersNotificationsRepository.updateById(id, usersNotifications);
  }

  @put('/users-notifications/{id}')
  @response(204, {
    description: 'UsersNotifications PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() usersNotifications: UsersNotifications,
  ): Promise<void> {
    await this.usersNotificationsRepository.replaceById(id, usersNotifications);
  }

  @del('/users-notifications/{id}')
  @response(204, {
    description: 'UsersNotifications DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.usersNotificationsRepository.deleteById(id);
  }
}
