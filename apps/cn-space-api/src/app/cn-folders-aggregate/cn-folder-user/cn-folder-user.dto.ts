import {
  CnFolderUser,
  CnFolderUserWithSharedBy,
  CnRootFolderNotifOptions,
  CnRootFolderUserRole,
} from './cn-folder-user.entity';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { Type } from 'class-transformer';
import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';

/**
 * Link between folder and user that stores the notification options
 */
export class CnFolderUserConfigDTO {
  folderNotif: CnRootFolderNotifOptions;

  messageNotif: CnRootFolderNotifOptions;

  scenarioNotif: CnRootFolderNotifOptions;

  noteNotif: CnRootFolderNotifOptions;

  documentNotif: CnRootFolderNotifOptions;

  constructor(folderUser?: CnFolderUser) {
    if (folderUser) {
      this.folderNotif = folderUser.folderNotif;
      this.messageNotif = folderUser.messageNotif;
      this.scenarioNotif = folderUser.scenarioNotif;
      this.noteNotif = folderUser.noteNotif;
      this.documentNotif = folderUser.documentNotif;
    }
  }
}

export class CnFolderUserDTO {
  @Type(() => CnUserEntity)
  user: CnUser;

  role: CnRootFolderUserRole;

  @Type(() => CnUserEntity)
  sharedBy: CnUser;

  @ClLuxonDateTimeTransform()
  sharedAt: DateTime;

  constructor(folderUser: CnFolderUserWithSharedBy) {
    this.user = folderUser.user;
    this.role = folderUser.role;
    this.sharedBy = folderUser.sharedBy;
    this.sharedAt = folderUser.sharedAt;
  }
}
