import {LabEntity} from '../global/lab-entity.entity';
import {
  FlEntityPaginatedDatasource,
  FlSanitizeTransform,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {BioxStudy} from './biox-study.class';
import {BioxTag} from './biox-tag.entity';
import {LabBaseEntityWithUser} from './lab-user.entity';
import {SecurityContext} from '@angular/core';

export type BioxExperimentStatus = 'DRAFT' | 'WAITING_FOR_CLI_PROCESS' | 'RUNNING' | 'SUCCESS' | 'ERROR';

// const to list the experiment status translation texts
export const bioxExperimentStatusDict: FlStatusDict<BioxExperimentStatus> = {
  DRAFT: FlStatusHelper.getDraftStatus('DRAFT'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  WAITING_FOR_CLI_PROCESS: FlStatusHelper.getSuccessStatus('WAITING_FOR_CLI_PROCESS', 'biox.experiment_waiting_for_cli', 'cached'),
};


export type BioxExperimentType = 'EXPERIMENT' | 'TRANSFORMER';

export const bioxExperimentTypeDict: FlStatusDict<BioxExperimentType> = {
  EXPERIMENT: FlStatusHelper.getInfoStatus('EXPERIMENT', 'biox.experiment_type_experiment'),
  TRANSFORMER: FlStatusHelper.getInfoStatus('EXPERIMENT', 'biox.experiment_type_transformer'),
}

export class BioxExperiment extends LabBaseEntityWithUser {

  @Expose({name: 'protocol_job_id'})
  protocolJobId: string;

  score: any;

  title: string;

  @FlSanitizeTransform(SecurityContext.HTML)
  description: string;

  data: void;

  @FlStatusTransform(bioxExperimentTypeDict)
  type: FlStatus<BioxExperimentType>;

  @Type(() => LabEntity)
  protocol: LabEntity;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @FlStatusTransform(bioxExperimentStatusDict)
  status: FlStatus<BioxExperimentStatus>;

  @Expose({name: 'is_validated'})
  isValidated: boolean;

  @Type(() => BioxStudy)
  study: BioxStudy;

  @Type(() => BioxTag)
  tags: BioxTag[];


  isEditable(): boolean {
    return !this.isArchived && !this.isValidated;
  }

  isRunning(): boolean {
    return this.status.value === 'RUNNING' || this.status.value === 'WAITING_FOR_CLI_PROCESS';
  }
}

export type BioxExperimentDatasource = FlEntityPaginatedDatasource<BioxExperiment>;

// form object to create an experiment
export interface ExperimentSimpleForm {
  title: string;
  description: string;
  study: BioxStudy;
}
