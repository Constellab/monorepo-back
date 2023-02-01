import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
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
import {BlBadRequestException, BlLuxonDateColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnGroup} from '../../cn-groups/cn-group.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {CnProjectLevel, CnProjectLevelStatus} from './cn-project-level.enum';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CmRichTextI} from '@monorepo/common-model';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
import {CnLabInstanceProject} from '../../cn-lab-instances/project/cn-lab-instance-project.entity';

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
  description: CmRichTextI;

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

  @Exclude()
  @ManyToMany(() => CnGroup)
  @JoinTable({name: 'project_group'})
  sharedGroups: CnGroup[];

  // level of this project, work package or task
  @Column({
    nullable: false, default: CnProjectLevel.PROJECT,
    type: 'enum', enum: CnProjectLevel,
    name: 'currentLevel', update: false
  })
  currentLevel: CnProjectLevel;

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

  public isSharedToGroup(groupId: string | string[]): boolean {
    if (this.sharedGroups == null) {
      throw new BlBadRequestException('The sharedGroups are not loaded in the project entity');
    }

    // check if one of the provided group is a shared group of the project
    const groupIds = ClHelpService.convertObjectOrArrayToArray(groupId);
    return this.sharedGroups.find(group => groupIds.includes(group.id)) != null;
  }

  public getSharedGroupIds(): string[] {
    return this.sharedGroups.map(group => group.id);
  }

  public removeSharedGroup(groupId: string): void {
    const index = this.sharedGroups.findIndex(group => group.id === groupId);

    if (index >= 0) {
      this.sharedGroups.splice(index, 1);
    }
  }

  public getRootParentId(): string {
    if (this.currentLevel === CnProjectLevel.PROJECT) {
      return this.id;
    }
    return this.rootParentId;
  }

}

