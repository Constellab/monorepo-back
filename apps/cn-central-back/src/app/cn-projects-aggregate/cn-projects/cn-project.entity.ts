import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Relation,
  Tree,
  TreeChildren,
  TreeParent
} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {CnEntityWithStatus} from '../../cn-core/model/entities/cn-entity-with-status.entity';
import {DateTime} from 'luxon';
import {BlLuxonDateColumn, BlNotUpdatable, BlRichTextContent, BlRichTextI} from '@monorepo/back-core-lib';
import {CnProjectLevel, CnProjectLevelStatus} from './cn-project-level.enum';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
import {CnLabInstanceProject} from '../../cn-lab-instances/project/cn-lab-instance-project.entity';
import {CnProjectUser} from '../cn-project-user/cn-project-user.entity';
import {CnBucket} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';

/**
 * A project is an ensemble of experiments
 */
@Entity('project')
@Tree('materialized-path')
export class CnProject extends CnEntityWithStatus<CnProjectStatusHistory> {

  @Column({nullable: false, length: 20})
  code: string;

  @Column({nullable: false, length: 100})
  title: string;

  @Exclude()
  @Column({type: 'simple-json', nullable: true})
  description: BlRichTextContent;

  @Exclude()
  @Column({type: 'simple-json', nullable: true})
  descriptionOld: BlRichTextI;

  @BlLuxonDateColumn({nullable: false})
  startingDate: DateTime;

  @BlLuxonDateColumn({nullable: true})
  endingDate: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  leader: Relation<CnUser>;

  @Type(() => CnProjectStatusHistory)
  @OneToOne(() => CnProjectStatusHistory, {nullable: true, eager: true, onDelete: 'CASCADE'})
  @JoinColumn()
  currentStatus: CnProjectStatusHistory;

  // level of this project, work package or task
  @Column({
    nullable: false, default: CnProjectLevel.PROJECT, update: false
  })
  currentLevel: number;

  @Column({
    nullable: false, update: false,
    type: 'enum', enum: CnProjectLevelStatus,
  })
  levelStatus: CnProjectLevelStatus;

  // parent project of this project, can be null if this project is a project
  @TreeParent()
  @BlNotUpdatable()
  parent?: CnProject;

  @Column({nullable: true, update: false})
  parentId?: string;

  @TreeChildren()
  children: CnProject[];

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnProject, {nullable: true})
  rootParent?: CnProject;

  @Column({nullable: true, update: false})
  rootParentId?: string;

  @Exclude()
  @BlNotUpdatable()
  @ManyToOne(() => CnSpace, {nullable: false})
  space: CnSpace;

  @Column({nullable: false, update: false})
  spaceId: string;

  // N to N labs to uses this project
  @OneToMany(() => CnLabInstanceProject,
    (labInstanceProject: CnLabInstanceProject) => labInstanceProject.project)
  labInstances: CnLabInstanceProject[];

  @Exclude()
  @OneToMany(() => CnProjectUser, projectUser => projectUser.project)
  users: CnProjectUser[];

  @Exclude()
  @ManyToOne(() => CnBucket, {nullable: true})
  mainStorage: CnBucket;

  @Exclude()
  @ManyToOne(() => CnBucket, {nullable: true})
  backupStorage: CnBucket;

  public getRootParentId(): string {
    if (this.currentLevel === CnProjectLevel.PROJECT) {
      return this.id;
    }
    return this.rootParentId;
  }

  public isRootProject(): boolean {
    return this.currentLevel === CnProjectLevel.PROJECT;
  }

  public sortChildrenTree(): this {
    this.children.sort((a, b) => a.code.localeCompare(b.code));
    this.children.forEach(child => child.sortChildrenTree());
    return this;
  }

}

