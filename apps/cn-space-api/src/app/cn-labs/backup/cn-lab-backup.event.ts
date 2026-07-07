import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnLab } from '../cn-lab.entity';
import { CnLabBackupHistory } from './cn-lab-backup-history.entity';

export const CN_LAB_BACKUP_EVENT_NAME = 'cn-lab-backup-event';

export type CnLabBackupEventType = 'BACKUP_STATUS_ERROR';

export type CnLabBackupEventPayload = {
  type: 'BACKUP_STATUS_ERROR';
  entity: CnLabBackupHistory;
};

export interface CnLabBackupEvent {
  payload: CnLabBackupEventPayload;
  lab: CnLab;
  space: CnSpace;
  user: CnUser;
}

@Injectable()
export class CnLabBackupEventService {
  constructor(private eventEmitter: EventEmitter2) {}

  public emitBackupEvent(payload: CnLabBackupEventPayload, lab: CnLab): void {
    const event: CnLabBackupEvent = {
      payload,
      lab,
      user: CnCurrentUserHelper.getAndCheckCurrentUser(),
      space: CnCurrentUserHelper.getAndCheckCurrentSpace(),
    };
    this.eventEmitter.emit(CN_LAB_BACKUP_EVENT_NAME, event);
  }
}
