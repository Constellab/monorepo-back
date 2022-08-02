import {
  FlEntityPaginatedDatasource,
  FlQuillJson,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {PrEntityWithTag} from './pr-entity-with-tag.entity';
import {PrEntity} from './pr-entity.entity';
import {PrUser} from './pr-user.entity';

export type PrExperimentStatus = 'DRAFT' | 'IN_QUEUE' | 'WAITING_FOR_CLI_PROCESS' | 'RUNNING' | 'SUCCESS' | 'ERROR';

// const to list the experiment status translation texts
export const labExperimentStatusDict: FlStatusDict<PrExperimentStatus> = {
  DRAFT: FlStatusHelper.getDraftStatus('DRAFT'),
  IN_QUEUE: FlStatusHelper.getInfoStatus('IN_QUEUE', 'biox.experiment_in_queue', FlStatusHelper.draftIcon),
  SUCCESS: FlStatusHelper.getSuccessStatus('SUCCESS'),
  ERROR: FlStatusHelper.getErrorStatus('ERROR'),
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  WAITING_FOR_CLI_PROCESS: FlStatusHelper.getInfoStatus('WAITING_FOR_CLI_PROCESS', 'biox.experiment_waiting_for_cli',
    FlStatusHelper.draftIcon),
};


export type PrExperimentType = 'EXPERIMENT' | 'TRANSFORMER' | 'IMPORTER' | 'FS_NODE_EXTRACTOR';

export const labExperimentTypeDict: FlStatusDict<PrExperimentType> = {
  EXPERIMENT: FlStatusHelper.getInfoStatus('EXPERIMENT', 'biox.experiment_type_experiment'),
  TRANSFORMER: FlStatusHelper.getInfoStatus('TRANSFORMER', 'biox.experiment_type_transformer', 'transformer'),
  IMPORTER: FlStatusHelper.getInfoStatus('IMPORTER', 'biox.experiment_type_importer'),
  FS_NODE_EXTRACTOR: FlStatusHelper.getInfoStatus('FS_NODE_EXTRACTOR', 'biox.experiment_type_extractor'),
};

export class PrExperiment extends PrEntityWithTag {

  score: any;

  title: string;

  description: FlQuillJson;

  data: void;

  @FlStatusTransform(labExperimentTypeDict)
  type: FlStatus<PrExperimentType>;

  @Type(() => PrEntity)
  protocol: PrEntity;

  @FlStatusTransform(labExperimentStatusDict)
  status: FlStatus<PrExperimentStatus>;

  @Expose({name: 'is_validated'})
  isValidated: boolean;

  @Expose({name: 'validated_by'})
  @Type(() => PrUser)
  validatedBy?: PrUser;

  @Expose({name: 'validated_at'})
  @ClLuxonTransform()
  validatedAt?: DateTime;

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

export type PrExperimentDatasource = FlEntityPaginatedDatasource<PrExperiment>;

// form object to create an experiment
export interface PrExperimentSimpleForm {
  title: string;
  project: PrEntity;
}
