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
import {LabUser} from './lab-user.entity';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {LabProject, LabProjectObject} from './lab-project.class';
import {LabRunningProcessInfo} from './process/lab-process.entity';

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


export type LabExperimentType = 'EXPERIMENT' | 'TRANSFORMER' | 'IMPORTER' | 'FS_NODE_EXTRACTOR' | 'RESOURCE_DOWNLOADER';

export const labExperimentTypeDict: FlStatusDict<LabExperimentType> = {
  EXPERIMENT: FlStatusHelper.getInfoStatus('EXPERIMENT', 'biox.experiment_type_experiment'),
  TRANSFORMER: FlStatusHelper.getInfoStatus('TRANSFORMER', 'biox.experiment_type_transformer', 'transformer'),
  IMPORTER: FlStatusHelper.getInfoStatus('IMPORTER', 'biox.experiment_type_importer'),
  FS_NODE_EXTRACTOR: FlStatusHelper.getInfoStatus('FS_NODE_EXTRACTOR', 'biox.experiment_type_extractor'),
  RESOURCE_DOWNLOADER: FlStatusHelper.getInfoStatus('RESOURCE_DOWNLOADER', 'biox.experiment_type_downloader'),
};

export class LabExperiment extends LabEntityWithTag implements LabProjectObject {

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

  @Expose({name: 'validated_by'})
  @Type(() => LabUser)
  validatedBy?: LabUser;

  @Expose({name: 'validated_at'})
  @ClLuxonDateTimeTransform()
  validatedAt?: DateTime;

  @Expose({name: 'last_sync_at'})
  @ClLuxonDateTimeTransform()
  lastSyncAt?: DateTime;

  @Expose({name: 'last_sync_by'})
  @Type(() => LabUser)
  lastSyncBy?: LabUser;

  get isSynced(): boolean {
    return this.lastSyncAt != null;
  }

  @Type(() => LabProject)
  project: LabProject;

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

export class LabRunningExperimentInfo extends LabEntity {

  title: string;

  @Expose({name: 'running_tasks'})
  @Type(() => LabRunningProcessInfo)
  runningTasks: LabRunningProcessInfo;

  project: {
    id: string;
    title: string;
  };
}
