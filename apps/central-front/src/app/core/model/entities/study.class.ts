import {JsonObject, JsonProperty} from 'json2typescript';
import {BaseEntity} from './base-entity.class';
import {StatusHistory} from './status-history.class';
import {FlGetStatusClassColorFunction, FlGetStatusIconFunction} from '@monorepo/front-core-lib';

export enum StudyStatus {
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  ARCHIVED = 'ARCHIVED'
}

@JsonObject('StudyStatusHistory')
export class StudyStatusHistory extends StatusHistory<StudyStatus> {
  getStatusClassColor(mode: 'background' | 'text'): string {
    return getStudyStatusColorClass(this.status, mode);
  }

  getStatusIcon(): string {
    return getStudyStatusIcon(this.status);
  }
}

@JsonObject('Study')
export class Study extends BaseEntity {
  @JsonProperty('title', String)
  title: string = null;

  @JsonProperty('description', String, true)
  description: string = null;

  @JsonProperty('currentStatus', StudyStatusHistory)
  currentStatus: StudyStatusHistory = null;
}

export const getStudyStatusColorClass: FlGetStatusClassColorFunction = (status: StudyStatus,
                                                                        mode: 'background' | 'text' = 'background'): string => {
  switch (status) {
    case 'STARTED':
      return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
    case 'FINISHED':
      return mode === 'background' ? 'g-accent-background' : 'g-accent-text';
    case 'ARCHIVED':
      return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
    default:
      return '';
  }
};

export const getStudyStatusIcon: FlGetStatusIconFunction = (status: StudyStatus): string => {
  switch (status) {
    case 'STARTED':
      return 'cached';
    case 'FINISHED':
      return 'done';
    case 'ARCHIVED':
      return 'archive';
    default:
      return '';
  }
};
