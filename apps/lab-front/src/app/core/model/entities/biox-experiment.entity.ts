import {LabBaseEntity, LabEntity} from '../global/lab-entity.entity';
import {FlEntityPaginatedDatasource, FlGetStatusClassColorFunction, FlGetStatusIconFunction, FlStatus} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';
import {ViewModel} from '../global/view-model.entity';


export class BioxExperimentData {

  title: string;

  // todo to sanitize ?
  description: string;
}

export type BioxExperimentStatus = 'running' | 'finished';

export class BioxExperiment extends LabBaseEntity implements FlStatus {

  @Expose({name: 'protocol_job_uri'})
  protocolJobId: string;

  score: any;

  @Expose({name: 'is_in_progress'})
  isInProgress: boolean;

  @Type(() => BioxExperimentData)
  data: BioxExperimentData;

  @Type(() => LabEntity)
  protocol: LabEntity;

  getStatusClassColor(mode: 'background' | 'text'): string {
    return getBioxExperimentStatusColorClass(this.isInProgress, mode);
  }

  getStatusIcon(): string {
    return getBioxExperimentStatusStatusIcon(this.isInProgress);
  }

  getStatusName(): BioxExperimentStatus {
    return this.isInProgress ? 'running' : 'finished';
  }
}

export type BioxExperimentVM = ViewModel<BioxExperiment>;

export type BioxExperimentDatasource = FlEntityPaginatedDatasource<BioxExperiment>;

const getBioxExperimentStatusColorClass: FlGetStatusClassColorFunction = (status: boolean,
                                                                          mode: 'background' | 'text' = 'background'): string => {
  // if is in progress
  if (status) {
    return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
  } else {
    return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
  }
};

const getBioxExperimentStatusStatusIcon: FlGetStatusIconFunction = (status: boolean): string => {
  // if is in progress
  if (status) {
    return 'cached';
  } else {
    return 'done';
  }
};
