import {BaseEntity} from './base-entity.class';
import {StatusHistory} from './status-history.class';
import {DateTime} from 'luxon';
import {ClLuxonDateTransform} from '@monorepo/core-lib';
import {
  FlEntityPaginatedDatasource,
  FlGetStatusClassColorFunction,
  FlGetStatusIconFunction,
  FlSanitizeTransform
} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {SecurityContext} from '@angular/core';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  ARCHIVED = 'ARCHIVED'
}

export class ProjectStatusHistory extends StatusHistory<ProjectStatus> {
  getStatusClassColor(mode: 'background' | 'text'): string {
    return getProjectStatusColorClass(this.status, mode);
  }

  getStatusIcon(): string {
    return getProjectStatusIcon(this.status);
  }
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


export const getProjectStatusColorClass: FlGetStatusClassColorFunction = (projectStatus: ProjectStatus,
                                                                          mode: 'background' | 'text' = 'background'): string => {
  switch (projectStatus) {
    case 'ACTIVE':
      return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
    case 'IN_PROGRESS':
      return mode === 'background' ? 'g-accent-background' : 'g-accent-text';
    case 'ARCHIVED':
      return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
    default:
      return '';
  }
};

export const getProjectStatusIcon: FlGetStatusIconFunction = (projectStatus: ProjectStatus): string => {
  switch (projectStatus) {
    case 'ACTIVE':
      return 'done';
    case 'IN_PROGRESS':
      return 'cached';
    case 'ARCHIVED':
      return 'archive';
    default:
      return '';
  }
};
