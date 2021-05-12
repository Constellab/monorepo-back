import {BioxConnection, BioxConnectionPart, BioxNode} from '../global/biox-connection.class';
import {Exclude, Expose, Type} from 'class-transformer';
import {FlLazyPropertyLabTransform} from '../../utils/lab-lazy-property.transform';
import {BioxResourceService} from '../../entity-service/biox-resource.service';
import {FlLazyProperty} from '@monorepo/front-core-lib';
import {BioxResourceVM} from './biox-resource.entity';

/**
 * Part of a link between different processable in protocol
 */
export class BioxProtocolLinkPart implements BioxConnectionPart {

  @Expose({name: 'node'})
  nodeName: string;

  port: string;

  // node init by the connection manager with setNode method
  @Exclude()
  bioxNode: BioxNode;

  getNodeName(): string {
    return this.nodeName;
  }

  setNodeName(name: string): void {
    this.nodeName = name;
  }

  getPort(): string {
    return this.port;
  }

  getBioxNode(): BioxNode {
    return this.bioxNode;
  }

  setBioxNode(node: BioxNode): void {
    this.bioxNode = node;
  }
}

/**
 * Object that contains the resources passed between process
 */
export class BioxProtocolLink implements BioxConnection {

  @Type(() => BioxProtocolLinkPart)
  from: BioxProtocolLinkPart;

  @Type(() => BioxProtocolLinkPart)
  to: BioxProtocolLinkPart;

  @FlLazyPropertyLabTransform(BioxResourceService)
  resource: FlLazyProperty<BioxResourceVM>;
}
