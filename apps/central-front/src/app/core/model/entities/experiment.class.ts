import {BaseEntity} from './base-entity.class';
import {LabInstance} from './lab-instance.class';
import {StatusHistory} from './status-history.class';
import {Protocol} from './protocol.entity';
import {FlGetStatusClassColorFunction, FlGetStatusIconFunction} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export enum ExperimentStatus {
  DRAFT = 'DRAFT',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  ARCHIVED = 'ARCHIVED'
}

export class ExperimentStatusHistory extends StatusHistory<ExperimentStatus> {
  getStatusClassColor(mode: 'background' | 'text'): string {
    return getExperimentStatusColorClass(this.status, mode);
  }

  getStatusIcon(): string {
    return getExperimentStatusIcon(this.status);
  }
}

export class Experiment extends BaseEntity {

  label: string;

  description: string;

  @Type(() => Protocol)
  protocol: Protocol;

  @Type(() => LabInstance)
  labInstance: LabInstance;

  @Type(() => ExperimentStatusHistory)
  currentStatus: ExperimentStatusHistory;

  hasProtocol(): boolean {
    return this.protocol?.hasProtocol() ?? false;
  }

  statusIsDraft(): boolean {
    return this.currentStatus.status === 'DRAFT';
  }
}

export const getExperimentStatusColorClass: FlGetStatusClassColorFunction = (status: ExperimentStatus,
                                                                             mode: 'background' | 'text' = 'background'): string => {
  switch (status) {
    case 'STARTED':
      return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
    case 'FINISHED':
      return mode === 'background' ? 'g-accent-background' : 'g-accent-text';
    case 'ARCHIVED':
    case 'DRAFT':
      return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
    default:
      return '';
  }
};

export const getExperimentStatusIcon: FlGetStatusIconFunction = (status: ExperimentStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'edit';
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

