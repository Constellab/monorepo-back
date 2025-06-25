import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { CnFrontService } from '../../cn-core/services/cn-front.service';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnNotificationType } from '../../cn-notification/cn-notification.entity';
import { CnNotificationService } from '../../cn-notification/cn-notification.service';
import { CnSpaceAggregateService } from '../../cn-spaces/cn-space-aggregate.service';
import { CnLabNotificationCreateDTO } from './cn-lab-notification.dto';

@Injectable()
export class CnLabNotificationService {
  constructor(
    private notificationService: CnNotificationService,
    private spaceService: CnSpaceAggregateService
  ) {}

  public async sendNotificationFromCurrentLab(labNotification: CnLabNotificationCreateDTO): Promise<void> {
    const createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    const spaceId = CnCurrentUserHelper.getAndCheckCurrentSpace().id;
    const lab = CnCurrentUserHelper.getAndCheckCurrentLab();
    const link = labNotification.link ?? CnFrontService.getLabRoute(lab.id);

    for (const receiverId of labNotification.receiver_ids) {
      const spaceUser = await this.spaceService.getSpaceUserIfAccess(spaceId, receiverId);
      if (!spaceUser) {
        throw new BlBadRequestException(
          `User with id ${receiverId} does not have access to space with id ${spaceId}`
        );
      }
      await this.notificationService.createNotification({
        createdBy: createdBy,
        spaceId: spaceId,
        user: spaceUser.user,
        link: link,
        objectId: lab.id,
        objectType: CnNotificationType.LAB,
        text: labNotification.text,
        text2: lab.name,
        associatedObjectIds: labNotification.associated_object_ids,
      });
    }
  }
}
