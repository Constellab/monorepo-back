import {LabBaseEntity, LabEntity} from '../global/lab-entity.entity';
import {FlEntityPaginatedDatasource, FlGetStatusClassColorFunction, FlGetStatusIconFunction, FlStatus} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ViewModel} from '../global/view-model.entity';
import {BioxStudy} from './biox-study.class';


export class BioxExperimentData {

  title: string;

  // todo to sanitize ?
  description: string;
}

export type BioxExperimentStatus = 'DRAFT' | 'WAITING_FOR_CLI_PROCESS' | 'RUNNING' | 'SUCCESS' | 'ERROR';


export class BioxExperiment extends LabBaseEntity implements FlStatus {

  @Expose({name: 'protocol_job_uri'})
  protocolJobId: string;

  score: any;


  @Type(() => BioxExperimentData)
  data: BioxExperimentData;

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

  getStatusClassColor(mode: 'background' | 'text'): string {
    return getBioxExperimentStatusColorClass(this.getStatusName(), mode);
  }

  getStatusIcon(): string {
    return getBioxExperimentStatusStatusIcon(this.getStatusName());
  }

  getStatusName(): BioxExperimentStatus {
    return this.status;
  }

  isEditable(): boolean {
    return !this.isArchived && !this.isValidated;
  }
}

export type BioxExperimentVM = ViewModel<BioxExperiment>;

export type BioxExperimentDatasource = FlEntityPaginatedDatasource<BioxExperiment>;

const getBioxExperimentStatusColorClass: FlGetStatusClassColorFunction = (status: BioxExperimentStatus,
                                                                          mode: 'background' | 'text' = 'background'): string => {
  switch (status) {
    case 'ERROR':
      return mode === 'background' ? 'g-warn-background' : 'g-warn-text';
    default:
      return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
  }
};

const getBioxExperimentStatusStatusIcon: FlGetStatusIconFunction = (status: BioxExperimentStatus): string => {
  switch (status) {
    case 'DRAFT':
      return 'edit';
    case 'ERROR':
      return 'error';
    case 'SUCCESS':
      return 'done';
    case 'RUNNING':
    case 'WAITING_FOR_CLI_PROCESS':
      return 'cached';
  }
};


// form object to create an experiment
export interface ExperimentSimpleForm {
  title: string;
  description: string;
  study: BioxStudy;
}
