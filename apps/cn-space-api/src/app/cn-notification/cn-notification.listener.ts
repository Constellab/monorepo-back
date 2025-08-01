import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CnSpaceEvent, cnSpaceEventName } from '../cn-spaces/cn-space.event';
import { CnNotificationService } from './cn-notification.service';

@Injectable()
export class CnNotificationListener {
  private readonly logger = new Logger(CnNotificationListener.name);

  constructor(private notificationService: CnNotificationService) {}

  @OnEvent(cnSpaceEventName)
  async handleSpaceEvent(event: CnSpaceEvent): Promise<void> {
    // when a user is removed from a space, we delete all notifications related to this user and this space
    if (event.type === 'REMOVE_USER_FROM_SPACE') {
      await this.notificationService
        .deleteNotificationByUserAndSpace(event.userId, event.spaceId)
        .catch((err) =>
          this.logger.error(
            `Error while deleting notifications for user ${event.userId} and space ${event.spaceId}. Error '${err}'`
          )
        );
    }
  }
}
