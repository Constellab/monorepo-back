import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn, BlNotification } from '@monorepo/back-core-lib';
import { Exclude, Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../cn-users/cn-user.entity';
import { CnSpace, CnSpaceEntity } from '../cn-spaces/cn-space.entity';
import { ClDateHelper } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { CnActivityEntityType } from '../cn-activity/cn-activity.entity';

@Entity('notification')
export class CnNotification extends BlEntityWithId implements BlNotification {
  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  createdBy: CnUser;

  @Column()
  isRead: boolean = false;

  @Column()
  link: string;

  @Column()
  objectId: string;

  @Column({ type: 'enum', enum: CnActivityEntityType, update: false })
  objectType: CnActivityEntityType;

  @Column()
  text: string;

  @Column()
  text2: string;

  @Type(() => CnSpaceEntity)
  @ManyToOne(() => CnSpaceEntity, { eager: true, nullable: true })
  space: CnSpace;

  @Column({ nullable: true, update: false })
  spaceId: string;

  @Exclude()
  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  user: CnUser;

  // list of object ids that are associated with the object id
  // use to associate this notification with multiple objects
  @Column({ nullable: true, update: false, type: 'simple-json' })
  associatedObjectIds: string[];

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
    this.associatedObjectIds = notificationData.associatedObjectIds ?? [];
  }
}

export interface CnNotificationCreateDTO {
  createdBy: CnUser;
  objectType: CnActivityEntityType;
  objectId: string;
  user: CnUser;
  text: string;
  text2: string;
  spaceId?: string;
  link: string;
  associatedObjectIds?: string[];
}
