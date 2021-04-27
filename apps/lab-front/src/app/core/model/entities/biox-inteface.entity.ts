import {BioxConnection, BioxConnectionPart, BioxNode} from '../global/biox-connection.class';
import {Expose, Type} from 'class-transformer';
import {FlLazyPropertyLabTransform} from '../../utils/lab-lazy-property.transform';
import {BioxResourceService} from '../../entity-service/biox-resource.service';
import {FlLazyProperty} from '@monorepo/front-core-lib';
import {BioxResourceVM} from './biox-resource.entity';

export class BioxProtocolInterfacePart implements BioxConnectionPart {

  @Expose({name: 'node'})
  nodeName: string;

  // node automatically set by the ConnectionManager
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

export class BioxProtocolInterface implements BioxConnection {

  @Type(() => BioxProtocolInterfacePart)
  from: BioxProtocolInterfacePart;

  @Type(() => BioxProtocolInterfacePart)
  to: BioxProtocolInterfacePart;

  @FlLazyPropertyLabTransform(BioxResourceService)
  resource: FlLazyProperty<BioxResourceVM>;
}

