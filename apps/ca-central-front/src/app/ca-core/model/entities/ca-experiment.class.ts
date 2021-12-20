import {CaBaseEntity} from './ca-base-entity.class';
import {CaLabInstance} from './ca-lab-instance.class';
import {CaStatusHistory} from './ca-status-history.class';
import {FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export type CaExperimentStatus = 'DRAFT' | 'SUCCESS' | 'ERROR' | 'ARCHIVED';

export const caExperimentStatusDict: FlStatusDict<CaExperimentStatus> = {
  DRAFT: FlStatusHelper.getInfoStatus('DRAFT'),
  ARCHIVED: FlStatusHelper.getInfoStatus('ARCHIVED'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR')
};

export class CaExperimentStatusHistory extends CaStatusHistory<CaExperimentStatus> {
  @FlStatusTransform(caExperimentStatusDict)
  status: FlStatus<CaExperimentStatus>;
}

export class Experiment extends CaBaseEntity {

  label: string;

  description: string;

  @Type(() => CaLabInstance)
  labInstance: CaLabInstance;

  @Type(() => CaExperimentStatusHistory)
  currentStatus: CaExperimentStatusHistory;

  statusIsDraft(): boolean {
    return this.currentStatus.status.value === 'DRAFT';
  }
}


