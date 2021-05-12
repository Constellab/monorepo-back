import {LabBaseEntity, LabEntity} from '../global/lab-entity.entity';
import {FlEntityPaginatedDatasource, FlGetStatusClassColorFunction, FlGetStatusIconFunction, FlStatus} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ViewModel} from '../global/view-model.entity';
import {BioxProtocolGraph} from './biox-processable.entity';


export class BioxExperimentData {

  title: string;

  // todo to sanitize ?
  description: string;
}

export type BioxExperimentStatus = 'draft' | 'running' | 'success' | 'error' | 'archived';

export class BioxExperiment extends LabBaseEntity implements FlStatus {

  @Expose({name: 'protocol_job_uri'})
  protocolJobId: string;

  score: any;


  @Type(() => BioxExperimentData)
  data: BioxExperimentData;

  @Type(() => LabEntity)
  protocol: LabEntity;

  @Expose({name: 'is_archived'})
  is_archived: boolean;

  @Expose({name: 'is_draft'})
  is_draft: boolean;

  @Expose({name: 'is_finished'})
  is_finished: boolean;

  @Expose({name: 'is_running'})
  is_running: boolean;

  @Expose({name: 'is_success'})
  is_success: boolean;

  @Expose({name: 'is_validated'})
  is_validated: boolean;

  getStatusClassColor(mode: 'background' | 'text'): string {
    return getBioxExperimentStatusColorClass(this.getStatusName(), mode);
  }

  getStatusIcon(): string {
    return getBioxExperimentStatusStatusIcon(this.getStatusName());
  }

  getStatusName(): BioxExperimentStatus {
    if (this.is_archived) {
      return 'archived';
    }
    if (this.is_running) {
      return 'running';
    }
    if (this.is_finished && this.is_success) {
      return 'success';
    }
    if (this.is_finished && !this.is_success) {
      return 'error';
    }

    return 'draft';
  }
}

export type BioxExperimentVM = ViewModel<BioxExperiment>;

export type BioxExperimentDatasource = FlEntityPaginatedDatasource<BioxExperiment>;

const getBioxExperimentStatusColorClass: FlGetStatusClassColorFunction = (status: BioxExperimentStatus,
                                                                          mode: 'background' | 'text' = 'background'): string => {
  // if is in progress
  if (status !== 'archived') {
    return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
  } else {
    return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
  }
};

const getBioxExperimentStatusStatusIcon: FlGetStatusIconFunction = (status: BioxExperimentStatus): string => {
  switch (status) {
    case 'archived':
      return 'inventory_2';
    case 'draft':
      return 'edit';
    case 'error':
      return 'error';
    case 'success':
      return 'done';
    case 'running':
      return 'cached';
  }
};


// form object to create an experiment
export interface ExperimentSimpleForm {
  title: string;
  description: string;
}

// object to update the experiment protocol
export interface ExperimentUpdate extends ExperimentSimpleForm {
  graph: BioxProtocolGraph;
}
