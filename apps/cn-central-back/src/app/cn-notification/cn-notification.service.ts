import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnNotification, CnNotificationCreateDTO, CnNotificationNumber} from './cn-notification.entity';
import {Raw, Repository} from 'typeorm';
import {BlAbstractService, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnSpaceUserService} from '../cn-spaces/cn-space-user.service';

export enum CnNotificationType {
  EXPERIMENT_COMMENT = 'EXPERIMENT_COMMENT',
  PROJECT_COMMENT = 'PROJECT_COMMENT',
  REPORT_COMMENT = 'REPORT_COMMENT',
  COMMENT_MENTION = 'COMMENT_MENTION',
  COMMENT_RESPONSE = 'COMMENT_RESPONSE',
  NEW_USER = 'NEW_USER',
}

@Injectable()
export class CnNotificationService extends BlAbstractService<CnNotification> {

  constructor(@InjectRepository(CnNotification) private notificationRepository: Repository<CnNotification>,
              private spaceUserService: CnSpaceUserService) {
    super(notificationRepository, CnNotification);
  }


  async createNotification(newNotification: CnNotificationCreateDTO): Promise<CnNotification> {
    const notif: CnNotification = new CnNotification();
    notif.setupNotif(newNotification);
    return this.notificationRepository.save(notif);
  }


  async getUserNotifications(onlyNotRead: boolean, page: number, size: number): Promise<ClPage<CnNotification>> {
    return this.findPaginated(page, size, {
      where: onlyNotRead ? {
        isRead: false,
        user: {
          id: CnCurrentUserHelper.getAndCheckCurrentUser().id
        },
        space: {id: Raw((id) => `${id} = :spaceId OR ${id} IS NULL`, {spaceId: CnCurrentUserHelper.getAndCheckCurrentSpace().id})}
      }
        :
        {
          user: {
            id: CnCurrentUserHelper.getAndCheckCurrentUser().id
          },
          space: {id: Raw((id) => `${id} = :spaceId OR ${id} IS NULL`, {spaceId: CnCurrentUserHelper.getAndCheckCurrentSpace().id})}
        },
      order: {
        createdAt: 'DESC' as any
      }
    });
  }

  async readAllNotification(): Promise<void> {
    const notifications: CnNotification[] = await this.notificationRepository.find(
      {
        where: [{
          user: {
            id: CnCurrentUserHelper.getAndCheckCurrentUser().id
          },
          space: {
            id: null
          },
          isRead: false
        }, {
          user: {
            id: CnCurrentUserHelper.getAndCheckCurrentUser().id
          },
          space: {
            id: CnCurrentUserHelper.getAndCheckCurrentSpace().id
          },
          isRead: false
        }]
      }
    );
    for (const notif of notifications) {
      await this.readNotification(notif);
    }
  }

  async read(notifId: string): Promise<void>{
    const notification: CnNotification = await this.notificationRepository.findOneBy({id: notifId});
    if(notification.isRead){
      return;
    }
    await this.readNotification(notification);
  }

  async readNotification(notification: CnNotification): Promise<void> {
    notification.isRead = true;
    await this.notificationRepository.save(notification);
  }

  async getCurrentNotificationsNumber(): Promise<CnNotificationNumber> {
    return {
      number: (await this.notificationRepository.findBy({
        user: {id: CnCurrentUserHelper.getAndCheckCurrentUser().id},
        isRead: false,
        space: {id: Raw((id) => `${id} = :spaceId OR ${id} IS NULL`, {spaceId: CnCurrentUserHelper.getAndCheckCurrentSpace().id})}
      })).length
    };
  }

  async getSpaceUserNotificationsNumber(spaceId: string): Promise<CnNotificationNumber> {
    if (!(await this.spaceUserService.userIsSpaceMember(spaceId, CnCurrentUserHelper.getAndCheckCurrentUser().id))) {
      throw new BlUnauthorizedException();
    }

    return {
      number: (await this.notificationRepository.findBy({
        space: {
          id: spaceId
        },
        user: {
          id: CnCurrentUserHelper.getAndCheckCurrentUser().id
        },
        isRead: false
      })).length
    };
  }

  async getEntityNotificationByLink(notifType: CnNotificationType, link: string): Promise<CnNotificationNumber> {
    if(link == null){
      return {
        number: 0
      }
    }

    return {
      number: (await this.notificationRepository.findBy({
        user: {
          id: CnCurrentUserHelper.getAndCheckCurrentUser().id
        },
        isRead: false,
        objectType: notifType,
        link: link
      })).length
    };
  }

  async getOtherSpacesNotificationsNumber(): Promise<CnNotificationNumber> {
    return {
      number: (await this.notificationRepository.findBy({
        user: {
          id: CnCurrentUserHelper.getAndCheckCurrentUser().id
        },
        isRead: false,
        space: {
          id: Raw((id) => `${id} != :spaceId AND ${id} IS NOT NULL`, {spaceId: CnCurrentUserHelper.getAndCheckCurrentSpace().id})
        },
      })).length
    };
  }

  async readEntityNotificationsByLink(notifType: CnNotificationType, link: string): Promise<void>{
    const notifications: CnNotification[] = await this.notificationRepository.findBy({
      user: {
        id: CnCurrentUserHelper.getAndCheckCurrentUser().id
      },
      isRead: false,
      objectType: notifType,
      link: link
    });
    for (const notif of notifications) {
      await this.readNotification(notif);
    }
  }

  async getNotReadNotifications(): Promise<CnNotification[]> {
    return this.notificationRepository.findBy({
      user: {
        id: CnCurrentUserHelper.getAndCheckCurrentUser().id
      },
      isRead: false
    });
  }

}
