import {LabEntity} from '../global/lab-entity.entity';
import {
  FlEntityPaginatedDatasource,
  FlGetStatusClassColorFunction,
  FlGetStatusIconFunction,
  FlSanitizeTransform,
  FlStatus,
  FlStatusColorMode,
  FlStatusHelper
} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ViewModel} from '../global/view-model.entity';
import {BioxStudy} from './biox-study.class';
import {BioxTag} from './biox-tag.entity';
import {LabBaseEntityWithUser} from './lab-user.entity';
import {SecurityContext} from '@angular/core';

export type BioxExperimentStatus = 'DRAFT' | 'WAITING_FOR_CLI_PROCESS' | 'RUNNING' | 'SUCCESS' | 'ERROR';

export type BioxExperimentType = 'EXPERIMENT' | 'TRANSFORMER';

export class BioxExperiment extends LabBaseEntityWithUser implements FlStatus {

  @Expose({name: 'protocol_job_id'})
  protocolJobId: string;

  score: any;

  title: string;

  @FlSanitizeTransform(SecurityContext.HTML)
  description: string;

  data: void;

  type: BioxExperimentType;

  @Type(() => LabEntity)
  protocol: LabEntity;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'status'})
  status: BioxExperimentStatus;

  @Expose({name: 'is_validated'})
  isValidated: boolean;

  @Type(() => BioxStudy)
  study: BioxStudy;

  @Type(() => BioxTag)
  tags: BioxTag[];

  getStatusClassColor(mode: 'background' | 'text'): string {
    return getBioxExperimentStatusColorClass(this.status, mode);
  }

  getStatusIcon(): string {
    return getBioxExperimentStatusStatusIcon(this.status);
  }

  getStatusName(): BioxExperimentStatus {
    return bioxExperimentStatusNames[this.status];
  }

  isEditable(): boolean {
    return !this.isArchived && !this.isValidated;
  }

  isRunning(): boolean {
    return this.status === 'RUNNING' || this.status === 'WAITING_FOR_CLI_PROCESS';
  }
}

export type BioxExperimentVM = ViewModel<BioxExperiment>;

export type BioxExperimentDatasource = FlEntityPaginatedDatasource<BioxExperiment>;

const getBioxExperimentStatusColorClass: FlGetStatusClassColorFunction = (status: BioxExperimentStatus,
                                                                          mode: FlStatusColorMode = 'background'): string => {
  switch (status) {
    case 'ERROR':
      return FlStatusHelper.getErrorColor(mode);
    case 'DRAFT':
      return FlStatusHelper.getInfoColor(mode);
    default:
      return FlStatusHelper.getSuccessColor(mode);
  }
};

const getBioxExperimentStatusStatusIcon: FlGetStatusIconFunction = (status: BioxExperimentStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'hourglass_empty';
    case 'ERROR':
      return FlStatusHelper.errorIcon;
    case 'SUCCESS':
      return FlStatusHelper.successIcon;
    case 'RUNNING':
    case 'WAITING_FOR_CLI_PROCESS':
      return 'cached';
  }
};

// const to list the experiment status translation texts
export const bioxExperimentStatusNames: Record<BioxExperimentStatus, any> = {
  DRAFT: 'biox.experiment_draft',
  SUCCESS: 'biox.experiment_success',
  ERROR: 'biox.experiment_error',
  RUNNING: 'biox.experiment_running',
  WAITING_FOR_CLI_PROCESS: 'biox.experiment_waiting_for_cli'
};


// form object to create an experiment
export interface ExperimentSimpleForm {
  title: string;
  description: string;
  study: BioxStudy;
}
