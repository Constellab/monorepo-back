import {LabConnection, LabConnectionPart, LabNode} from '../global/lab-connection.class';
import {Exclude, Expose, Type} from 'class-transformer';

/**
 * Part of a link between different process in protocol
 */
export class LabProtocolLinkPart implements LabConnectionPart {

  @Expose({name: 'node'})
  nodeName: string;

  port: string;

  // node init by the connection manager with setNode method
  @Exclude()
  labNode: LabNode;

  getNodeName(): string {
    return this.nodeName;
  }

  setNodeName(name: string): void {
    this.nodeName = name;
  }

  getPort(): string {
    return this.port;
  }

  getNode(): LabNode {
    return this.labNode;
  }

  setNode(node: LabNode): void {
    this.labNode = node;
  }
}

/**
 * Object that contains the resources passed between process
 */
export class LabProtocolLink implements LabConnection {

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
