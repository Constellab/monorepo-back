import {BaseEntity} from './base-entity.class';
import {LabInstance} from './lab-instance.class';
import {StatusHistory} from './status-history.class';
import {Protocol} from './protocol.entity';
import {FlGetStatusClassColorFunction, FlGetStatusIconFunction, FlStatusHelper} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export enum ExperimentStatus {
  DRAFT = 'DRAFT',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
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
    case 'ERROR':
      return FlStatusHelper.getErrorColor(mode);
    case 'DRAFT':
      return FlStatusHelper.getInfoColor(mode)
    default:
      return FlStatusHelper.getSuccessColor(mode);
  }
};

export const getExperimentStatusIcon: FlGetStatusIconFunction = (status: ExperimentStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'hourglass_empty';
    case 'SUCCESS':
      return FlStatusHelper.successIcon;
    case 'ERROR':
      return FlStatusHelper.errorIcon;
    case 'ARCHIVED':
      return 'archive';
    default:
      return '';
  }
};

