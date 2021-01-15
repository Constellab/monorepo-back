import {Any, JsonObject, JsonProperty} from 'json2typescript';
import {LabEntity} from '../global/lab-entity.entity';
import {ClLuxonConverter} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {FlEntityPaginatedDatasource, FlGetStatusClassColorFunction, FlGetStatusIconFunction, FlStatus} from '@monorepo/front-core-lib';


@JsonObject('BioxExperimentData')
export class BioxExperimentData extends LabEntity {

  @JsonProperty('title', String, true)
  title: string = null;

  @JsonProperty('description', String, true)
  description: string = null;
}

@JsonObject('BioxExperiment')
export class BioxExperiment extends LabEntity implements FlStatus {

  // python class link
  @JsonProperty('type', String, true)
  type: string = null;

  @JsonProperty('creation_datetime', ClLuxonConverter, true)
  createdAt: DateTime = null;

  @JsonProperty('protocol_job_uri', String, true)
  protocolJobId: string = null;

  @JsonProperty('score', Any, true)
  score: any = null;

  @JsonProperty('is_in_progress', Boolean)
  isInProgress: boolean = null;

  @JsonProperty('data', BioxExperimentData, true)
  data: BioxExperimentData = null;

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
