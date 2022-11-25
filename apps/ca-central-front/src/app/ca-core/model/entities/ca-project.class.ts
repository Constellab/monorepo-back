import {CaBaseEntity} from './ca-base-entity.class';
import {CaStatusHistory} from './ca-status-history.class';
import {DateTime} from 'luxon';
import {ClLuxonDateTransform} from '@monorepo/core-lib';
import {
  FlEntity,
  FlEntityPaginatedDatasource,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CaUser} from './ca-user.class';

export type CaProjectStatus = 'ACTIVE' | 'IN_PROGRESS' | 'ARCHIVED';

export const caProjectStatusDict: FlStatusDict<CaProjectStatus> = {
  ACTIVE: FlStatusHelper.getInfoStatus('ACTIVE', 'ACTIVE', 'done'),
  IN_PROGRESS: FlStatusHelper.getInfoStatus('IN_PROGRESS', 'IN_PROGRESS', FlStatusHelper.runningIcon),
  ARCHIVED: FlStatusHelper.getArchivedStatus('ARCHIVED'),
};

export class CaProjectStatusHistory extends CaStatusHistory<CaProjectStatus> {

  @FlStatusTransform(caProjectStatusDict)
  status: FlStatus<CaProjectStatus>;
}

export enum CaProjectLevel {
  // main level of the project
  PROJECT = 1,
  // sub-level of the project
  WORK_PACKAGE = 2,
  // sub-level of the work package
  TASK = 3,
}

export enum CaProjectLevelStatus {
  /**
   * Project that contains sub-projects. No object (experiment, report) can be associated to it
   */
  PARENT = 'PARENT',

  /**
   * Leaf project, no sub-project can be associated to it. Object (experiment, report) can be associated to it
   */
  LEAF = 'LEAF',
}

export class CaProject extends CaBaseEntity {

  code: string;

  title: string;

  @ClLuxonDateTransform()
  startingDate: DateTime;

  @ClLuxonDateTransform()
  endingDate: DateTime;

  @Type(() => CaProjectStatusHistory)
  currentStatus: CaProjectStatusHistory;

  // level of this project, work package or task
  currentLevel: CaProjectLevel;

  levelStatus: CaProjectLevelStatus;

  @Type(() => CaUser)
  leader: CaUser;

  isLeaf(): boolean {
    return this.levelStatus === CaProjectLevelStatus.LEAF;
  }

  isRoot(): boolean {
    return this.currentLevel === CaProjectLevel.PROJECT;
  }

  hasChildren(): boolean {
    return this.levelStatus === CaProjectLevelStatus.PARENT;
  }

  canHaveChildren(): boolean {
    return !this.isLeaf();
  }

  getChildLevel(): CaProjectLevel {
    switch (this.currentLevel) {
      case CaProjectLevel.PROJECT:
        return CaProjectLevel.WORK_PACKAGE;
      case CaProjectLevel.WORK_PACKAGE:
        return CaProjectLevel.TASK;
      default:
        return null;
    }

  }
}


export type CaProjectDatasource = FlEntityPaginatedDatasource<CaProject>;


/**
 * Interface representing an object inside a project that can be validated and synchronized with central
 */
export interface CaProjectObject extends FlEntity {

  isValidated: boolean;
  validatedBy?: CaUser;
  validatedAt?: DateTime;

  lastSyncAt?: DateTime;
  lastSyncBy?: CaUser;
}


export type CaProjectAncestorType = 'project' | 'experiment' | 'report';

export interface CaProjectObjectRef {
  id: string;
  type: CaProjectAncestorType;
}

/**
 * Object returned when retrieving the hierarchy of an object
 */
export interface CaProjectAncestorTreeDTO {
  id: string;
  title: string;
  type: CaProjectAncestorType;
}

export interface CaProjectTreeDto {
  id: string;
  title: string;
  children: CaProjectTreeDto[];
}
