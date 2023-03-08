import {BeforeInsert, Column, Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId, BlLuxonDateTimeColumn, BlNotification} from '@monorepo/back-core-lib';
import {Type} from 'class-transformer';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {CnNotificationType} from './cn-notification.service';
import {ClDateHelper} from '@monorepo/core-lib';
import {DateTime} from 'luxon';

@Entity('notification')
export class CnNotification extends BlEntityWithId implements BlNotification{

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  createdBy: CnUser;

  @Column()
  isRead: boolean = false;

  @Column()
  link: string;

  @Column()
  objectId: string;

  @Column()
  objectType: string;

  @Column()
  text: string;

  @Column()
  text2: string;

  @Type(() => CnSpace)
  @ManyToOne(() => CnSpace, {eager: true, nullable: false})
  space: CnSpace;

  @Column({nullable: true, update: false})
  spaceId: string;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  user: CnUser;

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdAt = ClDateHelper.getDate();
  }

  setupNotif(notificationData: CnNotificationCreateDTO): void {
    this.user = notificationData.user;
    this.spaceId = notificationData.spaceId;
    this.objectId = notificationData.objectId;
    this.objectType = notificationData.objectType;
    this.link = notificationData.link;
    this.text = notificationData.text;
    this.text2 = notificationData.text2;
    this.createdBy = notificationData.createdBy;
  }
}

export interface CnNotificationNumber{
  number: number;
}
export interface CnNotificationCreateDTO{
  createdBy: CnUser;
  objectType: CnNotificationType;
  objectId: string;
  user: CnUser;
  text: string;
  text2: string;
  spaceId?: string;
  link: string;
}
