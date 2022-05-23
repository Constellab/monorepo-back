import {LabEntity} from '../global/lab-entity.entity';
import {
  FlEntityPaginatedDatasource,
  FlQuillJson,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {LabEntityWithTag} from './lab-entity-with-tag.entity';

export type LabExperimentStatus = 'DRAFT' | 'IN_QUEUE' | 'WAITING_FOR_CLI_PROCESS' | 'RUNNING' | 'SUCCESS' | 'ERROR';

// const to list the experiment status translation texts
export const labExperimentStatusDict: FlStatusDict<LabExperimentStatus> = {
  DRAFT: FlStatusHelper.getDraftStatus('DRAFT'),
  IN_QUEUE: FlStatusHelper.getInfoStatus('IN_QUEUE', 'biox.experiment_in_queue', FlStatusHelper.draftIcon),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  WAITING_FOR_CLI_PROCESS: FlStatusHelper.getInfoStatus('WAITING_FOR_CLI_PROCESS', 'biox.experiment_waiting_for_cli',
    FlStatusHelper.draftIcon),
};


export type LabExperimentType = 'EXPERIMENT' | 'TRANSFORMER' | 'IMPORTER' | 'FS_NODE_EXTRACTOR';

export const labExperimentTypeDict: FlStatusDict<LabExperimentType> = {
  EXPERIMENT: FlStatusHelper.getInfoStatus('EXPERIMENT', 'biox.experiment_type_experiment'),
  TRANSFORMER: FlStatusHelper.getInfoStatus('TRANSFORMER', 'biox.experiment_type_transformer', 'move_down'),
  IMPORTER: FlStatusHelper.getInfoStatus('IMPORTER', 'biox.experiment_type_importer'),
  FS_NODE_EXTRACTOR: FlStatusHelper.getInfoStatus('FS_NODE_EXTRACTOR', 'biox.experiment_type_extractor'),
};

export class LabExperiment extends LabEntityWithTag {

  score: any;

  title: string;

  description: FlQuillJson;

  data: void;

  @FlStatusTransform(labExperimentTypeDict)
  type: FlStatus<LabExperimentType>;

  @Type(() => LabEntity)
  protocol: LabEntity;

  @FlStatusTransform(labExperimentStatusDict)
  status: FlStatus<LabExperimentStatus>;

  @Expose({name: 'is_validated'})
  isValidated: boolean;

  project: {
    id: string;
    title: string;
  };

  isEditable(): boolean {
    return !this.isArchived && !this.isValidated && !this.isRunning() && this.status.value !== 'IN_QUEUE';
  }

  isRunning(): boolean {
    return this.status.value === 'RUNNING' || this.status.value === 'WAITING_FOR_CLI_PROCESS';
  }
}

export type LabExperimentDatasource = FlEntityPaginatedDatasource<LabExperiment>;

// form object to create an experiment
export interface LabExperimentSimpleForm {
  title: string;
  project: LabEntity;
}
