import {CnExperimentStatus} from './cn-experiment-status.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {CnExperiment, CnExperimentProtocol} from './cn-experiment.entity';
import {CnLabConfigDto} from '../../cn-lab-configs/cn-lab-config.dto';
import {CmRichTextI} from '@monorepo/common-model';
import {Type} from 'class-transformer';
import {CnEntityDTO} from '../../cn-core/model/entities/cn.entity';
import {CnUser} from '../../cn-users/cn-user.entity';


/**
 * Experiment object from the Lab
 */
export class CnLabExperimentDto extends CnEntityDTO {
  title: string;
  description: CmRichTextI;
  status: CnExperimentStatus;

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
export class CnExperimentDTO extends CnEntityDTO {
  title: string;

  status: CnExperimentStatus;

  projectId: string;

  isValidated: boolean;

  lastSyncBy?: CnUser;

  @ClLuxonDateTimeTransform()
  lastSyncAt?: DateTime;


  copyEntity(entity: CnExperiment): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.projectId = entity.projectId;
    this.status = entity.status;
    this.isValidated = entity.isValidated;
    this.lastSyncAt = entity.lastSyncAt;
    this.lastSyncBy = entity.lastSyncBy;
    return this;
  }
}
