import {CaBaseEntity} from './ca-base-entity.class';
import {CaStatusHistory} from './ca-status-history.class';
import {DateTime} from 'luxon';
import {ClLuxonDateTransform} from '@monorepo/core-lib';
import {
  FlEntity,
  FlEntityPaginatedDatasource,
  FlSanitizeTransform,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {SecurityContext} from '@angular/core';
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

export class CaProject extends CaBaseEntity {

  code: string;

  title: string;

  @FlSanitizeTransform(SecurityContext.HTML)
  description: string;

  @ClLuxonDateTransform()
  startingDate: DateTime;

  @ClLuxonDateTransform()
  endingDate: DateTime;

  @Type(() => CaProjectStatusHistory)
  currentStatus: CaProjectStatusHistory;

  // level of this project, work package or task
  level: CaProjectLevel;

  // store the leaf level (lowest level) for the PROJECT
  // the leaf level is the same for all sur work packages and tasks
  leafLevel: CaProjectLevel;

  isLeaf(): boolean {
    return this.level === this.leafLevel;
  }

  isRoot(): boolean {
    return this.level === CaProjectLevel.PROJECT;
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
