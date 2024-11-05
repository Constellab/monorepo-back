import { CnScenarioStatus } from './cn-scenario-status.enum';
import { DateTime } from 'luxon';
import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { CnScenario, CnScenarioProtocol } from './cn-scenario.entity';
import { CnLabConfigDto } from '../../cn-lab-configs/cn-lab-config.dto';
import { Type } from 'class-transformer';
import { CnEntityDTO } from '../../cn-core/model/entities/cn.entity';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { BlRichTextContent, BlRichTextI } from '@monorepo/back-core-lib';

/**
 * Scenario object from the Lab
 */
export class CnSaveScenarioDto {
  id: string;
  title: string;
  description: BlRichTextContent | BlRichTextI;
  status: CnScenarioStatus;

  is_validated: boolean;

  @Type(() => CnUserEntity)
  validated_by?: CnUser;

  @ClLuxonDateTimeTransform()
  validated_at?: DateTime;

  @Type(() => CnUserEntity)
  last_sync_by?: CnUser;

  @ClLuxonDateTimeTransform()
  last_sync_at?: DateTime;

  @ClLuxonDateTimeTransform()
  created_at: DateTime;

  @Type(() => CnUserEntity)
  created_by: CnUser;

  @ClLuxonDateTimeTransform()
  last_modified_at: DateTime;

  @Type(() => CnUserEntity)
  last_modified_by: CnUser;
}

export class CnCreateLabScenarioDto {
  @Type(() => CnSaveScenarioDto)
  scenario: CnSaveScenarioDto;
  protocol: CnScenarioProtocol;
  lab_config: CnLabConfigDto;
}

// scenario object smaller
export class CnScenarioDto extends CnEntityDTO {
  title: string;

  status: CnScenarioStatus;

  isValidated: boolean;

  lastSyncBy?: CnUser;

  @ClLuxonDateTimeTransform()
  lastSyncAt?: DateTime;

  copyEntity(entity: CnScenario): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.status = entity.status;
    this.isValidated = entity.isValidated;
    this.lastSyncAt = entity.lastSyncAt;
    this.lastSyncBy = entity.lastSyncBy;
    return this;
  }
}

export interface CnSaveScenarioResultDTO {
  mode: 'create' | 'update';
  scenario: CnScenario;
}
