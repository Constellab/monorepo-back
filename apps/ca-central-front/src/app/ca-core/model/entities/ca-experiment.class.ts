import {CaBaseEntity} from './ca-base-entity.class';
import {CaLabInstance} from './ca-lab-instance.class';
import {CaStatusHistory} from './ca-status-history.class';
import {FlQuillJson, FlStatus, FlStatusDict, FlStatusHelper, FlStatusTransform} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {CaUser} from './ca-user.class';
import {CaProject} from './ca-project.class';

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

export class CaExperiment extends CaBaseEntity {

  title: string;

  description: FlQuillJson;

  @Type(() => CaLabInstance)
  labInstance: CaLabInstance;

  @FlStatusTransform(caExperimentStatusDict)
  status: FlStatus<CaExperimentStatus>;

  projectId: string;

  project?: CaProject;

  @Type(() => CaUser)
  validatedBy?: CaUser;

  @ClLuxonTransform()
  validatedAt?: DateTime;

  statusIsDraft(): boolean {
    return this.status.value === 'DRAFT';
  }
}

