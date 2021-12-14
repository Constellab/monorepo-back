import {BaseEntity} from './base-entity.class';
import {StatusHistory} from './status-history.class';
import {DateTime} from 'luxon';
import {ClLuxonDateTransform} from '@monorepo/core-lib';
import {
  FlEntityPaginatedDatasource,
  FlSanitizeTransform,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {SecurityContext} from '@angular/core';

export type ProjectStatus = 'ACTIVE' | 'IN_PROGRESS' | 'ARCHIVED';

export const projectStatusDict: FlStatusDict<ProjectStatus> = {
  ACTIVE: FlStatusHelper.getInfoStatus('ACTIVE', 'ACTIVE', 'done'),
  IN_PROGRESS: FlStatusHelper.getInfoStatus('ACTIVE', 'IN_PROGRESS', FlStatusHelper.runningIcon),
  ARCHIVED: FlStatusHelper.getArchivedStatus('ACTIVE'),
};

export class ProjectStatusHistory extends StatusHistory<ProjectStatus> {

  @FlStatusTransform(projectStatusDict)
  status: FlStatus<ProjectStatus>;
}


export class Project extends BaseEntity {

  code: string;

  title: string;

  @FlSanitizeTransform(SecurityContext.HTML)
  description: string;

  @ClLuxonDateTransform()
  startingDate: DateTime;

  @ClLuxonDateTransform()
  endingDate: DateTime;

  @Type(() => ProjectStatusHistory)
  currentStatus: ProjectStatusHistory;
}

export type ProjectDatasource = FlEntityPaginatedDatasource<Project>;

