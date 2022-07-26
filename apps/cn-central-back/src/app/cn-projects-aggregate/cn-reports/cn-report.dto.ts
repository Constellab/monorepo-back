import {CnBaseEntityDTO} from '../../cn-core/model/entities/cn-base.entity';
import {CnReport} from './cn-report.entity';
import {CmRichTextI} from '@monorepo/common-model';
import {CnLabConfigDto} from '../../cn-lab-configs/cn-lab-config.dto';
import {Type} from 'class-transformer';
import {BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';


export class CnCreateReportDto extends CnBaseEntityDTO {
  title: string;
  content: CmRichTextI;

  is_validated: boolean;
  validated_by?: { id: string };

  @BlLuxonDateTimeColumn()
  validated_at?: DateTime;

  last_sync_by?: { id: string };

  @BlLuxonDateTimeColumn()
  last_sync_at?: DateTime;
}

export class CnCreateReportWithConfigDto {
  @Type(() => CnCreateReportDto)
  report: CnCreateReportDto;
  lab_config: CnLabConfigDto;
  experiment_ids: string[];
}


// DTO used to lighten the weight of the report
export class CnReportDTO extends CnBaseEntityDTO {

  title: string;
  projectId: string;
  isValidated: boolean;

  copyEntity(entity: CnReport): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.projectId = entity.projectId;
    this.isValidated = entity.isValidated;
    return this;
  }
}
