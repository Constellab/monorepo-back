import {CmRichTextI} from '@monorepo/common-model';
import {CnLabConfigDto} from '../../cn-lab-configs/cn-lab-config.dto';
import {Type} from 'class-transformer';
import {DateTime} from 'luxon';
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
  // contains all the json view of the report
  // key = view id, value = json view
  resource_views: Record<string, any>;
}
