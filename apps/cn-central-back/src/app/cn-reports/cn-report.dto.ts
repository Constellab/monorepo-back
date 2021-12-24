import {CnBaseEntityDTO} from '../cn-core/model/entities/cn-base.entity';
import {CnReport} from './cn-report.entity';

export class CnCreateReportDto extends CnBaseEntityDTO {
  title: string;
  content: Record<string, any>;

  experimentIds: string[];
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
