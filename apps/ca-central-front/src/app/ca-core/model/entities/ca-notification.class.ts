import {CaEntity} from './ca-entity.entity';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {CaUser} from './ca-user.class';
import {CaSpace} from './space/ca-space.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';

export class CaNotification extends CaEntity {
  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Type(() => CaUser)
  createdBy: CaUser;

  @Type(() => CaUser)
  user: CaUser;

  isRead: boolean;

  link: string;

  objectId: string;

  objectType: CaNotificationType;

  text: string;

  text2: string;

  @Type(() => CaSpace)
  space: CaSpace;
}

export type CaNotificationDatasourcePaginated = FlDatasourcePaginated<CaNotification>;
export interface CaNotificationNumber {
  number: number;
}
export enum CaNotificationType {
  EXPERIMENT_COMMENT = 'EXPERIMENT_COMMENT',
  PROJECT_COMMENT = 'PROJECT_COMMENT',
  REPORT_COMMENT = 'REPORT_COMMENT',
  COMMENT_MENTION = 'COMMENT_MENTION',
  COMMENT_RESPONSE = 'COMMENT_RESPONSE',
  NEW_USER = 'NEW_USER',
}
