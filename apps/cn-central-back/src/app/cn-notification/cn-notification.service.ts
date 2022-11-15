import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnNotification, CnNotificationCreateDTO} from './cn-notification.entity';
import {Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';

export enum CnNotificationType {
  EXPERIMENT_COMMENT = 'EXPERIMENT_COMMENT',
  PROJECT_COMMENT = 'PROJECT_COMMENT',
  REPORT_COMMENT = 'REPORT_COMMENT',
  COMMENT_MENTION = 'COMMENT_MENTION',
  COMMENT_RESPONSE = 'COMMENT_RESPONSE'
}

@Injectable()
export class CnNotificationService extends BlAbstractService<CnNotification> {

  constructor(
    @InjectRepository(CnNotification) private notificationRepository: Repository<CnNotification>
  ) {
    super(notificationRepository, CnNotification);
  }


  async createNotification(newNotification: CnNotificationCreateDTO): Promise<CnNotification> {
    const notif: CnNotification = new CnNotification();
    notif.setupNotif(newNotification);
    return this.notificationRepository.save(notif);
  }


  async getUserNotifications(userId: string, onlyNotRead: boolean, page: number, size: number): Promise<ClPage<CnNotification>> {
    //TODO: Add organization filter
    return this.findPaginated(page, size, {
      where: onlyNotRead ? {
        isRead: false,
        user: {
          id: userId
        }
      }
        :
        {
          user: {
            id: userId
          }
        },
      order: {
        createdAt: 'DESC' as any
      }
    });
  }

  async readAllNotification(userId: string): Promise<void> {
    const notifications: CnNotification[] = await this.notificationRepository.find(
      {
        where: {
          user: {
            id: userId
          },
          isRead: false
        }
      }
    );
    for (const notif of notifications) {
      await this.readNotification(notif);
    }
  }

  async read(notifId: string): Promise<void>{
    const notification: CnNotification = await this.notificationRepository.findOneBy({id: notifId});
    if(notification.isRead){
      return ;
    }
    await this.readNotification(notification);
  }

  async readNotification(notification: CnNotification): Promise<void> {
    notification.isRead = true;
    await this.notificationRepository.save(notification);
  }

  async checkIfOrganizationAsNotification(organizationId: string): Promise<boolean>{
    return (await this.notificationRepository.findBy({organization: {id: organizationId}})).length > 0;
  }

}
