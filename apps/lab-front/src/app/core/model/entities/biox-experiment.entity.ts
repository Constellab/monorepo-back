import {LabEntity} from '../global/lab-entity.entity';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {FlEntityPaginatedDatasource, FlGetStatusClassColorFunction, FlGetStatusIconFunction, FlStatus} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';


export class BioxExperimentData {

  title: string;

  description: string;
}

export class BioxExperiment extends LabEntity implements FlStatus {

  // python class link
  type: string;

  @Expose({name: 'creation_datetime'})
  @ClLuxonTransform()
  createdAt: DateTime;

  @Expose({name: 'protocol_job_uri'})
  protocolJobId: string;

  score: any;

  @Expose({name: 'is_in_progress'})
  isInProgress: boolean;

  @Type(() => BioxExperimentData)
  data: BioxExperimentData;

  getStatusClassColor(mode: 'background' | 'text'): string {
    return getBioxExperimentStatusColorClass(this.isInProgress, mode);
  }

  getStatusIcon(): string {
    return getBioxExperimentStatusStatusIcon(this.isInProgress);
  }

  getStatusName(): string {
    return this.isInProgress ? 'running' : 'finished';
  }
}

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
