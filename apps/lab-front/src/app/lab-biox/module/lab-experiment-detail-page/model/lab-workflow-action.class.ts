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


/**
 * Object to describe the position of a new node relative to another node (usually because they are linked)
 */
export interface LabNodeRelativeCoord {
  nodeName: string;
  position: 'before' | 'after';
  layerId: string;
}
