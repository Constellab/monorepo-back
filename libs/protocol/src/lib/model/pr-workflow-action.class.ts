import {PrProcess} from './pr-process.entity';
import {PrProtocolLink} from './pr-protocol-link.entity';

export class PrAddProcessWithLink {

  process: PrProcess;

  link: PrProtocolLink;
}


/**
 * Object to describe the position of a new node relative to another node (usually because they are linked)
 */
export interface PrNodeRelativeCoord {
  nodeName: string;
  position: 'before' | 'after';
  layerId: string;
}
