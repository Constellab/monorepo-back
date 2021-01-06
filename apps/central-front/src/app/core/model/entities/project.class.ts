import {BaseEntity} from './base-entity.class';
import {JsonObject, JsonProperty} from 'json2typescript';
import {LuxonConverter} from '../../utils/json-converter';
import {GetStatusColorClassFunction, GetStatusIconFunction, StatusHistory} from './status-history.class';
import {EntityPaginatedDatasource} from '../datasource/entity-datasource.class';
import {DateTime} from 'luxon';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  ARCHIVED = 'ARCHIVED'
}

@JsonObject('ProjectStatusHistory')
export class ProjectStatusHistory extends StatusHistory<ProjectStatus> {
  getColor(mode: 'background' | 'text'): string {
    return getProjectStatusColorClass(this.status, mode);
  }

  getIcon(): string {
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

  @JsonProperty('startingDate', LuxonConverter)
  startingDate: DateTime = null;

  @JsonProperty('endingDate', LuxonConverter, true)
  endingDate: DateTime = null;

  @JsonProperty('currentStatus', ProjectStatusHistory)
  currentStatus: ProjectStatusHistory = null;
}

export type ProjectDatasource = EntityPaginatedDatasource<Project>;


export const getProjectStatusColorClass: GetStatusColorClassFunction = (projectStatus: ProjectStatus,
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

export const getProjectStatusIcon: GetStatusIconFunction = (projectStatus: ProjectStatus): string => {
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
