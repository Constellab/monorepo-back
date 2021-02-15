import {BioxConnection, BioxConnectionPart, BioxConnectionType, BioxNode} from '../global/biox-connection.class';
import {Expose, Type} from 'class-transformer';

export class BioxFlowInterfacePart implements BioxConnectionPart {

  @Expose({name: 'node'})
  nodeName: string;

  // name automatically set by the ConnectionManager
  node: BioxNode;

  port: string;

  getNodeName(): string {
    return this.nodeName;
  }

  getPort(): string {
    return this.port;
  }

  getNode(): BioxNode {
    return this.node;
  }

  setNode(node: BioxNode): void {
    this.node = node;
  }
}

export class BioxFlowInterface implements BioxConnection {

  @Type(() => BioxFlowInterfacePart)
  from: BioxFlowInterfacePart;

  @Type(() => BioxFlowInterfacePart)
  to: BioxFlowInterfacePart;

  getType(): BioxConnectionType {
    return 'interface';
  }
}

export class BioxFlowOuterface implements BioxConnection {

  // exchange the from and to properties, because they are in the wrong order in the back
  @Expose({name: 'to'})
  @Type(() => BioxFlowInterfacePart)
  from: BioxFlowInterfacePart;

  @Expose({name: 'from'})
  @Type(() => BioxFlowInterfacePart)
  to: BioxFlowInterfacePart;

  getType(): BioxConnectionType {
    return 'outerface';
  }
}
