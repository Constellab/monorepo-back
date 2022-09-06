import {Expose, Type} from 'class-transformer';

/**
 * Part of a link between different process in protocol
 */
export class LabProtocolLinkPart {

  @Expose({name: 'node'})
  nodeName: string;

  port: string;
}

/**
 * Object that contains the resources passed between process
 */
export class LabProtocolLink {

  @Type(() => LabProtocolLinkPart)
  from: LabProtocolLinkPart;

  @Type(() => LabProtocolLinkPart)
  to: LabProtocolLinkPart;

  resource_id: string;
}

/**
 * Object that represent the protocol interface and outerface
 */
export class LabProtocolIOFace extends LabProtocolLink {
  // name of the interface or outerface
  name: string;
}
