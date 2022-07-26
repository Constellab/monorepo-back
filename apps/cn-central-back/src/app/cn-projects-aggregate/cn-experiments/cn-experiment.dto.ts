import {CnExperimentStatus} from './cn-experiment-status.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {CnBaseEntityDTO} from '../../cn-core/model/entities/cn-base.entity';
import {CnExperiment, CnExperimentProtocol} from './cn-experiment.entity';
import {CnLabConfigDto} from '../../cn-lab-configs/cn-lab-config.dto';
import {CmRichTextI} from '@monorepo/common-model';
import {Type} from 'class-transformer';


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

  is_validated: boolean;

  validated_by?: { id: string };

  @ClLuxonDateTimeTransform()
  validated_at?: DateTime;

  last_sync_by?: { id: string };

  @ClLuxonDateTimeTransform()
  last_sync_at?: DateTime;
}

export class CnCreateLabExperimentDto {

  @Type(() => CnLabExperimentDto)
  experiment: CnLabExperimentDto;
  protocol: CnExperimentProtocol;
  lab_config: CnLabConfigDto;
}


// experiment object smaller
export class CnExperimentDTO extends CnBaseEntityDTO {
  title: string;

  status: CnExperimentStatus;

  projectId: string;

  isValidated: boolean;


  copyEntity(entity: CnExperiment): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.projectId = entity.projectId;
    this.status = entity.status;
    this.isValidated = entity.isValidated;
    return this;
  }
}
