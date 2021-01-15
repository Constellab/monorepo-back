import {BaseEntity} from './base-entity.class';
import {JsonObject, JsonProperty} from 'json2typescript';
import {StatusHistory} from './status-history.class';
import {DateTime} from 'luxon';
import {ClLuxonConverter} from '@monorepo/core-lib';
import {FlEntityPaginatedDatasource, FlGetStatusClassColorFunction, FlGetStatusIconFunction} from '@monorepo/front-core-lib';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  ARCHIVED = 'ARCHIVED'
}

@JsonObject('ProjectStatusHistory')
export class ProjectStatusHistory extends StatusHistory<ProjectStatus> {
  getStatusClassColor(mode: 'background' | 'text'): string {
    return getProjectStatusColorClass(this.status, mode);
  }

  getStatusIcon(): string {
    return getProjectStatusIcon(this.status);
  }
}


@JsonObject('Project')
export class Project extends BaseEntity {

  @JsonProperty('code', String)
  code: string = null;

  @JsonProperty('title', String)
  title: string = null;

  @JsonProperty('description', String, true)
  description: string = null;

  @JsonProperty('startingDate', ClLuxonConverter)
  startingDate: DateTime = null;

  @JsonProperty('endingDate', ClLuxonConverter, true)
  endingDate: DateTime = null;

  @JsonProperty('currentStatus', ProjectStatusHistory)
  currentStatus: ProjectStatusHistory = null;
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
