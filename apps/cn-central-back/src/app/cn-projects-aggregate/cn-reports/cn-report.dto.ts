import {CnBaseEntityDTO} from '../../cn-core/model/entities/cn-base.entity';
import {CnReport} from './cn-report.entity';
import {CmRichTextI} from '@monorepo/common-model';
import {CnLabConfigDto} from '../../cn-lab-configs/cn-lab-config.dto';

export interface CnCreateReportWithConfigDto {
  report: CnCreateReportDto;
  lab_config: CnLabConfigDto;
  experiment_ids: string[];
}


export interface CnCreateReportDto extends CnBaseEntityDTO {
  title: string;
  content: CmRichTextI;

}


// DTO used to lighten the weight of the report
export class CnReportDTO extends CnBaseEntityDTO {

  title: string;
  projectId: string;

  copyEntity(entity: CnReport): this {
    super.copyEntity(entity);
    this.title = entity.title;
    this.projectId = entity.projectId;
    return this;
  }
}
