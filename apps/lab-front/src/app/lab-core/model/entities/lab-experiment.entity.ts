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
import {LabProject} from './lab-project.class';
import {LabTag} from './lab-tag.entity';
import {LabBaseEntityWithUser} from './lab-user.entity';
import {SecurityContext} from '@angular/core';

export type LabExperimentStatus = 'DRAFT' | 'WAITING_FOR_CLI_PROCESS' | 'RUNNING' | 'SUCCESS' | 'ERROR';

// const to list the experiment status translation texts
export const labExperimentStatusDict: FlStatusDict<LabExperimentStatus> = {
  DRAFT: FlStatusHelper.getDraftStatus('DRAFT'),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  WAITING_FOR_CLI_PROCESS: FlStatusHelper.getSuccessStatus('WAITING_FOR_CLI_PROCESS', 'biox.experiment_waiting_for_cli', 'cached'),
};


export type LabExperimentType = 'EXPERIMENT' | 'TRANSFORMER' | 'IMPORTER';

export const labExperimentTypeDict: FlStatusDict<LabExperimentType> = {
  EXPERIMENT: FlStatusHelper.getInfoStatus('EXPERIMENT', 'biox.experiment_type_experiment'),
  TRANSFORMER: FlStatusHelper.getInfoStatus('TRANSFORMER', 'biox.experiment_type_transformer', 'move_down'),
  IMPORTER: FlStatusHelper.getInfoStatus('IMPORTER', 'biox.experiment_type_importer'),
}

export class LabExperiment extends LabBaseEntityWithUser {

  @Expose({name: 'protocol_job_id'})
  protocolJobId: string;

  score: any;

  title: string;

  @FlSanitizeTransform(SecurityContext.HTML)
  description: string;

  data: void;

  @FlStatusTransform(labExperimentTypeDict)
  type: FlStatus<LabExperimentType>;

  @Type(() => LabEntity)
  protocol: LabEntity;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @FlStatusTransform(labExperimentStatusDict)
  status: FlStatus<LabExperimentStatus>;

  @Expose({name: 'is_validated'})
  isValidated: boolean;

  @Type(() => LabProject)
  project: LabProject;

  @Type(() => LabTag)
  tags: LabTag[];


  isEditable(): boolean {
    return !this.isArchived && !this.isValidated;
  }

  isRunning(): boolean {
    return this.status.value === 'RUNNING' || this.status.value === 'WAITING_FOR_CLI_PROCESS';
  }
}

export type LabExperimentDatasource = FlEntityPaginatedDatasource<LabExperiment>;

// form object to create an experiment
export interface LabExperimentSimpleForm {
  title: string;
  description: string;
  project: LabProject;
}
