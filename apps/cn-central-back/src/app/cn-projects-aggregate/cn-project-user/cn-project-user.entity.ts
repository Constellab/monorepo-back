import {Column, Entity, ManyToOne, PrimaryColumn} from 'typeorm';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnProject} from '../cn-projects/cn-project.entity';
import {Exclude} from 'class-transformer';


export enum CnProjectNotifOptions {
  NOTIF_ONLY = 'NOTIF_ONLY',
  EMAIL_ONLY = 'EMAIL_ONLY',
  NOTIF_AND_EMAIL = 'NOTIF_AND_EMAIL',
  NONE = 'NONE',
}

@Entity('project_user')
export class CnProjectUser {

  @PrimaryColumn({type: 'varchar', length: 36})
  userId: string;

  @Exclude()
  @ManyToOne(() => CnUser, {onUpdate: 'CASCADE', onDelete: 'CASCADE', eager: true})
  user: CnUser;

  @PrimaryColumn({type: 'varchar', length: 36})
  projectId: string;

  @Exclude()
  @ManyToOne(() => CnProject,
    {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  project: CnProject;

  @Column({nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NONE})
  projectNotif: CnProjectNotifOptions;

  @Column({nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NOTIF_ONLY})
  commentNotif: CnProjectNotifOptions;

  @Column({nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NOTIF_ONLY})
  experimentNotif: CnProjectNotifOptions;

  @Column({nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NOTIF_ONLY})
  reportNotif: CnProjectNotifOptions;

  @Column({nullable: false, type: 'enum', enum: CnProjectNotifOptions, default: CnProjectNotifOptions.NOTIF_ONLY})
  documentNotif: CnProjectNotifOptions;

}
