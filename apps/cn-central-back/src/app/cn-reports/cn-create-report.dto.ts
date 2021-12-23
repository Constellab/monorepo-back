import {CnBaseEntityDTO} from '../cn-core/model/entities/cn-base.entity';

export class CnCreateReportDto extends CnBaseEntityDTO {
  title: string;
  content: any;

  experimentIds: string[];
}
