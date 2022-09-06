import {LabProcess} from '../../../../lab-core/model/entities/process/lab-process.entity';
import {LabProtocolLink} from '../../../../lab-core/model/entities/lab-protocol-link.entity';
import {LabProcessTransform} from '../../../../lab-core/model/entities/process/lab-process.transform';
import {Type} from 'class-transformer';


export class LabAddProcessWithLink {

  @LabProcessTransform()
  process: LabProcess;

  @Type(() => LabProtocolLink)
  link: LabProtocolLink;
}

