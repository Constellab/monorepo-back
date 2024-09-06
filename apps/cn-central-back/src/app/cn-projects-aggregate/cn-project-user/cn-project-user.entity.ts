import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CnUser } from '../../cn-users/cn-user.entity';
import { Exclude } from 'class-transformer';
import { CnFolderHierarchyEntity } from '../cn-folder-hierarchies/cn-folder-hierarchy.entity';


export enum CnProjectNotifOptions {
  NOTIF_ONLY = 'NOTIF_ONLY',
  EMAIL_ONLY = 'EMAIL_ONLY',
  NOTIF_AND_EMAIL = 'NOTIF_AND_EMAIL',
  NONE = 'NONE',
}

@Entity('project_user')
export class CnProjectUser {

  @PrimaryColumn({ type: 'varchar', length: 36 })
  userId: string;

  @Exclude()
  @ManyToOne(() => CnUser, { onUpdate: 'CASCADE', onDelete: 'CASCADE', eager: true })
  user: CnUser;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  rootFolderId: string;

  @Exclude()
  @JoinColumn({name: 'rootFolderId'})
  @ManyToOne(() => CnFolderHierarchyEntity, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  rootFolder: CnFolderHierarchyEntity;

  @Column({ nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NONE })
  projectNotif: CnProjectNotifOptions;

  @Column({ nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NOTIF_ONLY })
  commentNotif: CnProjectNotifOptions;

  @Column({ nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NOTIF_ONLY })
  experimentNotif: CnProjectNotifOptions;

  @Column({ nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NOTIF_ONLY })
  reportNotif: CnProjectNotifOptions;

  @Column({ nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NOTIF_ONLY })
  documentNotif: CnProjectNotifOptions;

}
