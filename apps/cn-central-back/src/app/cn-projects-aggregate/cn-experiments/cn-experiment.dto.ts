import { CnExperimentStatus } from './cn-experiment-status.enum';
import { DateTime } from 'luxon';
import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { CnExperiment, CnExperimentProtocol } from './cn-experiment.entity';
import { CnLabConfigDto } from '../../cn-lab-configs/cn-lab-config.dto';
import { Type } from 'class-transformer';
import { CnEntityDTO } from '../../cn-core/model/entities/cn.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { BlRichTextContent, BlRichTextI } from '@monorepo/back-core-lib';


/**
 * Experiment object from the Lab
 */
export class CnSaveExperimentDto {
  id: string;
  title: string;
  description: BlRichTextContent | BlRichTextI;
  status: CnExperimentStatus;

  is_validated: boolean;

  @Type(() => CnUser)
  validated_by?: CnUser;

  @ClLuxonDateTimeTransform()
  validated_at?: DateTime;

  @Type(() => CnUser)
  last_sync_by?: CnUser;

  @ClLuxonDateTimeTransform()
  last_sync_at?: DateTime;

  @ClLuxonDateTimeTransform()
  created_at: DateTime;

  @Type(() => CnUser)
  created_by: CnUser;

  @ClLuxonDateTimeTransform()
  last_modified_at: DateTime;

  @Type(() => CnUser)
  last_modified_by: CnUser;
}

export class CnCreateLabExperimentDto {

  @Type(() => CnSaveExperimentDto)
  experiment: CnSaveExperimentDto;
  protocol: CnExperimentProtocol;
  lab_config: CnLabConfigDto;
}


// experiment object smaller
export class CnExperimentDTO extends CnEntityDTO {
  title: string;

  status: CnExperimentStatus;

  isValidated: boolean;

  lastSyncBy?: CnUser;

  @ClLuxonDateTimeTransform()
  lastSyncAt?: DateTime;


  copyEntity(entity: CnExperiment): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.status = entity.status;
    this.isValidated = entity.isValidated;
    this.lastSyncAt = entity.lastSyncAt;
    this.lastSyncBy = entity.lastSyncBy;
    return this;
  }
}

export interface CnSaveExperimentResultDTO {
  mode: 'create' | 'update';
  experiment: CnExperiment;
}
