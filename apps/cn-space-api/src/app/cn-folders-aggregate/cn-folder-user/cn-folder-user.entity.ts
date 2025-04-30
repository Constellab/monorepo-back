import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { Exclude } from 'class-transformer';
import { CnHierarchyObjectEntity } from '../cn_hierarchy_objects/cn-hierarchy-object.entity';

export enum CnFolderNotifOptions {
  NOTIF_ONLY = 'NOTIF_ONLY',
  EMAIL_ONLY = 'EMAIL_ONLY',
  NOTIF_AND_EMAIL = 'NOTIF_AND_EMAIL',
  NONE = 'NONE',
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
  @JoinColumn({ name: 'rootFolderId' })
  @ManyToOne(() => CnHierarchyObjectEntity, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  rootFolder: CnHierarchyObjectEntity;

  @Column({ nullable: false, type: 'enum', enum: CnFolderNotifOptions, default: CnFolderNotifOptions.NONE })
  folderNotif: CnFolderNotifOptions;

  @Column({
    nullable: false,
    type: 'enum',
    enum: CnFolderNotifOptions,
    default: CnFolderNotifOptions.NOTIF_ONLY,
  })
  messageNotif: CnFolderNotifOptions;

  @Column({ nullable: false, type: 'enum', enum: CnFolderNotifOptions, default: CnFolderNotifOptions.NONE })
  scenarioNotif: CnFolderNotifOptions;

  @Column({ nullable: false, type: 'enum', enum: CnFolderNotifOptions, default: CnFolderNotifOptions.NONE })
  noteNotif: CnFolderNotifOptions;

  @Column({ nullable: false, type: 'enum', enum: CnFolderNotifOptions, default: CnFolderNotifOptions.NONE })
  documentNotif: CnFolderNotifOptions;
}

export type CnFolderUser = Omit<CnFolderUserEntity, 'rootFolder'>;
