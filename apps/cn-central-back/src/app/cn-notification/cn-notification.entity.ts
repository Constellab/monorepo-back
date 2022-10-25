import {Column, Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId, BlLuxonDateTimeColumn, BlNotification} from '@monorepo/back-core-lib';
import {Type} from 'class-transformer';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnOrganization} from '../cn-organizations/cn-organization.entity';
import {CnNotificationType} from './cn-notification.service';

@Entity('notification')
export class CnNotification extends BlEntityWithId implements BlNotification{

  @BlLuxonDateTimeColumn({nullable: false, update: false})
  createdAt: string;

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

  @Type(() => CnOrganization)
  @ManyToOne(() => CnOrganization, {eager: true, nullable: false})
  organization: CnOrganization;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  user: CnUser;

  setupNotif(notificationData: CnNotificationCreateDTO): void {
    this.createdBy = notificationData.createdBy;
    this.user = notificationData.user;
    this.organization = notificationData.organization;
    this.objectId = notificationData.objectId;
    this.objectType = notificationData.objectType;
    this.link = notificationData.link;
    this.text = notificationData.text;
    this.text2 = notificationData.text2;
  }
}

export interface CnNotificationCreateDTO{
  createdBy: CnUser;
  objectType: CnNotificationType;
  objectId: string;
  user: CnUser;
  text: string;
  text2: string;
  organization: CnOrganization;
  link: string;
}
