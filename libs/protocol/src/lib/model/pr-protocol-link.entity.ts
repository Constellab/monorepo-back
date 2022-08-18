/**
 * Part of a link between different process in protocol
 */

import {PrConnection, PrConnectionPart, PrNode} from './pr-connection.class';
import {
  PrProtocolGraphInputIntOut,
  PrProtocolGraphInputLink,
  PrProtocolGraphInputLinkNode
} from './pr-protocol-graph-input.class';

export class PrProtocolLinkPart implements PrConnectionPart {

  nodeName: string;

  port: string;

  // node init by the connection manager with setNode method
  labNode: PrNode;

  getNodeName(): string {
    return this.nodeName;
  }

  setNodeName(name: string): void {
    this.nodeName = name;
  }

  getPort(): string {
    return this.port;
  }

  getNode(): PrNode {
    return this.labNode;
  }

  setNode(node: PrNode): void {
    this.labNode = node;
  }

  constructor(linkNode?: PrProtocolGraphInputLinkNode) {
    if(linkNode){
      this.port = linkNode.port;
      this.nodeName = linkNode.node;
    }
  }
}

/**
 * Object that contains the resources passed between process
 */
export class PrProtocolLink implements PrConnection {

  from: PrProtocolLinkPart;

  to: PrProtocolLinkPart;

  constructor(inputLink?: PrProtocolGraphInputLink) {
    if(inputLink){
      this.from = new PrProtocolLinkPart(inputLink.from);
      this.to = new PrProtocolLinkPart(inputLink.to);
    }

  }
}

/**
 * Object that represent the protocol interface and outerface
 */
export class PrProtocolIOFace extends PrProtocolLink {
  // name of the interface or outerface
  name: string;

  constructor(intOut?: PrProtocolGraphInputIntOut) {
    super();
    if(intOut){
      this.name = intOut.name;
      this.from = new PrProtocolLinkPart(intOut.from);
      this.to = new PrProtocolLinkPart(intOut.to);
    }
  }
}
