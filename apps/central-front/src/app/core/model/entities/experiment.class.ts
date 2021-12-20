import {BaseEntity} from './base-entity.class';
import {LabInstance} from './lab-instance.class';
import {StatusHistory} from './status-history.class';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export type ExperimentStatus = 'DRAFT' | 'SUCCESS' | 'ERROR' | 'ARCHIVED';

export const experimentStatusDict: FlStatusDict<ExperimentStatus> = {
  DRAFT: FlStatusHelper.getInfoStatus('DRAFT'),
  ARCHIVED: FlStatusHelper.getInfoStatus('ARCHIVED'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR')
};

export class ExperimentStatusHistory extends StatusHistory<ExperimentStatus> {
  @FlStatusTransform(experimentStatusDict)
  status: FlStatus<ExperimentStatus>;
}

export class Experiment extends BaseEntity {

  label: string;

  description: string;

  @Type(() => LabInstance)
  labInstance: LabInstance;

  @Type(() => ExperimentStatusHistory)
  currentStatus: ExperimentStatusHistory;

  statusIsDraft(): boolean {
    return this.currentStatus.status.value === 'DRAFT';
  }
}


