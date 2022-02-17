import {CnExperimentStatus} from './cn-experiment-status.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {CnBaseEntityDTO} from '../cn-core/model/entities/cn-base.entity';
import {CnExperiment, CnExperimentProtocol} from './cn-experiment.entity';
import {CnLabConfigDto} from '../cn-lab-configs/cn-lab-config.dto';
import {CmRichTextI} from '@monorepo/common-model';

export class CnCreateLabExperimentDto {
  experiment: CnLabExperimentDto;
  protocol: CnExperimentProtocol;
  lab_config: CnLabConfigDto;
}


/**
 * Experiment object from the Lab
 */
export class CnLabExperimentDto {
  id: string;
  title: string;
  description: CmRichTextI;
  status: CnExperimentStatus;

  @ClLuxonDateTimeTransform()
  created_at: DateTime;

  @ClLuxonDateTimeTransform()
  last_modified_at: DateTime;
}

// experiment object smaller
export class CnExperimentDTO extends CnBaseEntityDTO {
  title: string;

  status: CnExperimentStatus;

  projectId: string;


  copyEntity(entity: CnExperiment): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.projectId = entity.projectId;
    this.status = entity.status;
    return this;
  }
}
