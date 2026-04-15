import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Exclude, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';

import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { CnHierarchyObjectEntity } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';

export enum CnRootFolderNotifOptions {
  NOTIF_ONLY = 'NOTIF_ONLY',
  EMAIL_ONLY = 'EMAIL_ONLY',
  NOTIF_AND_EMAIL = 'NOTIF_AND_EMAIL',
  NONE = 'NONE',
}

export enum CnRootFolderUserRole {
  OWNER = 'OWNER',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export class CnRootFolderUserRoleObj {
  constructor(private role: CnRootFolderUserRole) {}

  getRoleValue(): number {
    switch (this.role) {
      case CnRootFolderUserRole.OWNER:
        return 3;
      case CnRootFolderUserRole.USER:
        return 2;
      case CnRootFolderUserRole.VIEWER:
        return 1;
    }
  }

  isHigherOrEqualThan(role: CnRootFolderUserRole): boolean {
    return this.getRoleValue() >= new CnRootFolderUserRoleObj(role).getRoleValue();
  }

  isLowerThan(role: CnRootFolderUserRole): boolean {
    return this.getRoleValue() < new CnRootFolderUserRoleObj(role).getRoleValue();
  }
}

@Entity('folder_user')
export class CnFolderUserEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  userId: string;

  @Exclude()
  @ManyToOne(() => CnUserEntity, { onUpdate: 'CASCADE', onDelete: 'CASCADE', eager: true })
  user: CnUser;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  rootFolderId: string;

  @Exclude()
  @JoinColumn()
  @ManyToOne(() => CnHierarchyObjectEntity, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  rootFolder: CnHierarchyObjectEntity;

  @Column({ nullable: false, type: 'enum', enum: CnRootFolderUserRole })
  role: CnRootFolderUserRole;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  sharedAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { nullable: false })
  @BlNotUpdatable()
  sharedBy: Relation<CnUser>;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CnRootFolderNotifOptions,
    default: CnRootFolderNotifOptions.NONE,
  })
  folderNotif: CnRootFolderNotifOptions;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CnRootFolderNotifOptions,
    default: CnRootFolderNotifOptions.NOTIF_ONLY,
  })
  messageNotif: CnRootFolderNotifOptions;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CnRootFolderNotifOptions,
    default: CnRootFolderNotifOptions.NONE,
  })
  scenarioNotif: CnRootFolderNotifOptions;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CnRootFolderNotifOptions,
    default: CnRootFolderNotifOptions.NONE,
  })
  noteNotif: CnRootFolderNotifOptions;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CnRootFolderNotifOptions,
    default: CnRootFolderNotifOptions.NONE,
  })
  documentNotif: CnRootFolderNotifOptions;

  get roleObj(): CnRootFolderUserRoleObj {
    return new CnRootFolderUserRoleObj(this.role);
  }
}

export type CnFolderUser = Omit<CnFolderUserEntity, 'rootFolder' | 'sharedBy'>;

export type CnFolderUserWithSharedBy = Omit<CnFolderUserEntity, 'rootFolder'>;
