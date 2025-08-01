import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { TeRichText, TeRichTextTransform } from '@monorepo/te-text-editor';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';

import { CnEntityDTO } from '../../cn-core/model/entities/cn.entity';
import { CnLabConfigDto } from '../../cn-lab-configs/cn-lab-config.dto';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { CnScenario } from './cn-scenario.entity';
import { CnScenarioProtocol } from './cn-scenario-protocol.class';
import { CnScenarioStatus } from './cn-scenario-status.enum';

/**
 * Scenario object from the Lab
 */
export class CnSaveScenarioDto {
  id: string;
  title: string;

  @TeRichTextTransform()
  description: TeRichText;

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

export interface CnScenarioLabSyncDTO {
  id: string;
  folder_id: string;
  last_sync_at: DateTime;
  last_sync_by: CnUser;
}
