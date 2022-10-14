import {CnReport} from './cn-report.entity';
import {CmRichTextI} from '@monorepo/common-model';
import {CnLabConfigDto} from '../../cn-lab-configs/cn-lab-config.dto';
import {Type} from 'class-transformer';
import {DateTime} from 'luxon';
import {CnEntityDTO} from '../../cn-core/model/entities/cn.entity';
import {CnUser} from '../../cn-users/cn-user.entity';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';


export class CnSaveReportDto {
  id: string;
  title: string;
  content: CmRichTextI;

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

export class CnCreateReportWithConfigDto {
  @Type(() => CnSaveReportDto)
  report: CnSaveReportDto;
  lab_config: CnLabConfigDto;
  experiment_ids: string[];
}


// DTO used to lighten the weight of the report
export class CnReportDTO extends CnEntityDTO {

  title: string;
  projectId: string;
  isValidated: boolean;

  lastSyncBy?: CnUser;

  @ClLuxonDateTimeTransform()
  lastSyncAt?: DateTime;

  copyEntity(entity: CnReport): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.projectId = entity.projectId;
    this.isValidated = entity.isValidated;
    this.lastSyncBy = entity.lastSyncBy;
    this.lastSyncAt = entity.lastSyncAt;
    return this;
  }
}
