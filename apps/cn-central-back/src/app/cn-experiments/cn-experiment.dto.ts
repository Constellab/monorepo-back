import {CnExperimentStatus} from './cn-experiment-status.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {CnBaseEntityDTO} from '../cn-core/model/entities/cn-base.entity';
import {CnExperimentStatusHistory} from './cn-experiment-status-history.entity';
import {Type} from 'class-transformer';
import {CnExperiment} from './cn-experiment.entity';

/**
 * Experiment object from the Lab
 */
export class CnLabExperimentDto {
  id: string;
  title: string;
  description: Record<string, any>;
  status: CnExperimentStatus;

  @ClLuxonDateTimeTransform()
  created_at: DateTime;

  @ClLuxonDateTimeTransform()
  last_modified_at: DateTime;
}

// experiment object smaller
export class CnExperimentDTO extends CnBaseEntityDTO {
  title: string;

  @Type(() => CnExperimentStatusHistory)
  currentStatus: CnExperimentStatusHistory;

  projectId: string;


  copyEntity(entity: CnExperiment): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.currentStatus = entity.currentStatus;
    this.projectId = entity.projectId;
    return this;
  }
}
