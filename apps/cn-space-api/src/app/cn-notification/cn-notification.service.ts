import { BlAbstractService } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, IsNull, Not, Raw, Repository } from 'typeorm';

import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnNotificationCountBySpace } from './cn-notification.dto';
import { CnNotification, CnNotificationCreateDTO, CnNotificationType } from './cn-notification.entity';

@Injectable()
export class CnNotificationService extends BlAbstractService<CnNotification> {
  constructor(@InjectRepository(CnNotification) private notificationRepository: Repository<CnNotification>) {
    super(notificationRepository, CnNotification);
  }

  async createNotification(newNotification: CnNotificationCreateDTO): Promise<CnNotification> {
    const notif: CnNotification = new CnNotification();
    notif.setupNotif(newNotification);
    return this.notificationRepository.save(notif);
  }

  async getUserNotifications(page: number, size: number): Promise<ClPage<CnNotification>> {
    return (
      await this.findPaginated(page, size, {
        where: {
          user: {
            id: CnCurrentUserHelper.getAndCheckCurrentUser().id,
          },
          space: {
            id: Raw((id) => `(${id} = :spaceId OR ${id} IS NULL)`, {
              spaceId: CnCurrentUserHelper.getAndCheckCurrentSpace().id,
            }),
          },
        },
        order: {
          createdAt: 'DESC' as any,
        },
      })
    ).map((notif: CnNotification) => {
      if (notif.text2.length > 36) {
        notif.text2 = notif.text2.substring(0, 35) + '...';
      }
      return notif;
    });
  }

  async readAllNotification(): Promise<void> {
    const notifications: CnNotification[] = await this.notificationRepository.find({
      where: [
        {
          user: { id: CnCurrentUserHelper.getAndCheckCurrentUser().id },
          space: { id: CnCurrentUserHelper.getAndCheckCurrentSpace().id },
          isRead: false,
        },
        // also include the notif that are not attached to a space
        {
          user: { id: CnCurrentUserHelper.getAndCheckCurrentUser().id },
          space: IsNull(),
          isRead: false,
        },
      ],
    });
    for (const notif of notifications) {
      notif.isRead = true;
    }
    await this.notificationRepository.save(notifications);
  }

  async read(notifId: string): Promise<void> {
    const notification: CnNotification = await this.notificationRepository.findOneBy({ id: notifId });
    if (notification.isRead) {
      return;
    }
    await this.readNotification(notification);
  }

  async readNotification(notification: CnNotification): Promise<void> {
    notification.isRead = true;
    await this.notificationRepository.save(notification);
  }

  async readNotifications(notificationIds: string[]): Promise<void> {
    await this.notificationRepository.update(
      {
        id: In(notificationIds),
        user: { id: CnCurrentUserHelper.getAndCheckCurrentUser().id },
      },
      { isRead: true }
    );
  }

  async countNotReadBySpace(): Promise<CnNotificationCountBySpace[]> {
    const notRead = await this.notificationRepository.find({
      where: {
        user: {
          id: CnCurrentUserHelper.getAndCheckCurrentUser().id,
        },
        space: Not(IsNull()),
        isRead: false,
      },
    });

    // group by space
    const notReadBySpace: CnNotificationCountBySpace[] = [];
    for (const notif of notRead) {
      const notifSpace = notReadBySpace.find((space) => space.spaceId === notif.space.id);
      if (notifSpace) {
        notifSpace.notReadCount++;
      } else {
        notReadBySpace.push({ spaceId: notif.space.id, notReadCount: 1 });
      }
    }

    return notReadBySpace;
  }

  public deleteNotificationByObject(objectType: CnNotificationType, objectId: string): Promise<DeleteResult> {
    return this.notificationRepository.delete({ objectType, objectId });
  }

  public deleteNotificationByUserAndSpace(userId: string, spaceId: string): Promise<DeleteResult> {
    return this.notificationRepository.delete({ user: { id: userId }, space: { id: spaceId } });
  }
}
