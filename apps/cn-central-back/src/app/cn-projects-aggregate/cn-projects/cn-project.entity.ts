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
import {BlLuxonDateColumn, BlNotUpdatable, BlRichTextI} from '@monorepo/back-core-lib';
import {CnProjectLevel, CnProjectLevelStatus} from './cn-project-level.enum';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
import {CnLabInstanceProject} from '../../cn-lab-instances/project/cn-lab-instance-project.entity';
import {CnProjectUser} from '../cn-project-user/cn-project-user.entity';

/**
 * A project is an ensemble of experiments
 */
@Entity('project')
@Tree('materialized-path')
export class CnProject extends CnEntityWithStatus<CnProjectStatusHistory> {

  @Column({nullable: false, length: 20})
  code: string;

  @Column({nullable: false, length: 50})
  title: string;

  @Exclude()
  @Column({type: 'simple-json', nullable: true})
  description: BlRichTextI;

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
  space?: CnSpace;

  @Column({nullable: false, update: false})
  spaceId: string;

  // N to N labs to uses this project
  @OneToMany(() => CnLabInstanceProject,
    (labInstanceProject: CnLabInstanceProject) => labInstanceProject.project)
  labInstances: CnLabInstanceProject[];

  @Exclude()
  @OneToMany(() => CnProjectUser, projectUser => projectUser.project)
  users: CnProjectUser[];

  public getRootParentId(): string {
    if (this.currentLevel === CnProjectLevel.PROJECT) {
      return this.id;
    }
    return this.rootParentId;
  }

}

