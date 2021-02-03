import {LabEntity} from '../global/lab-entity.entity';
import {BioxConfig} from './biox-config.entity';
import {BioxJob} from './biox-job.entity';
import {ClLuxonTransform, ClRecordTransform} from '@monorepo/core-lib';
import {BioxConnection, BioxConnectionManager, BioxConnectionPart, BioxConnectionType, BioxNode} from '../global/biox-connection.class';
import {DateTime} from 'luxon';
import {BioxProcessableBase} from './biox-processable-base.entity';
import {Expose, Type} from 'class-transformer';
import {BioxResource} from './biox-resource.entity';
import {FlLazyProperty, FlLazyPropertyTransform} from '@monorepo/front-core-lib';
import {BioxResourceService} from '../../entity-service/biox-resource.service';


export class BioxFlowInterfacePart implements BioxConnectionPart {

  @Expose({name: 'node'})
  nodeName: string;

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


export class BioxFlowProcess extends LabEntity {
  port: string;

  @Expose({name: 'instance_name'})
  instanceName: string;
}

export class BioxFlowJob implements BioxConnectionPart {

  @Expose({name: 'job_uri'})
  jobId: string;

  @Type(() => BioxFlowProcess)
  process: BioxFlowProcess;

  job: BioxJob;

  // if the interface is provided, the connection is linked to the process main interface
  interface ?: Record<string, { port: string }>;

  getNodeName(): string {
    return this.process.instanceName;
  }

  getPort(): string {
    return this.process.port;
  }

  getNode(): BioxJob {
    return this.job;
  }

  setNode(node: BioxJob): void {
    this.job = node;
  }
}

/**
 * Object that contains the resources passed between process
 */
export class BioxFlowStep implements BioxConnection {

  @Type(() => BioxFlowJob)
  from: BioxFlowJob;

  @Type(() => BioxFlowJob)
  to: BioxFlowJob;

  @Expose({name: 'resource_uri'})
  @FlLazyPropertyTransform(BioxResourceService)
  resource: FlLazyProperty<BioxResource>;

  getType(): BioxConnectionType {
    if(this.from.interface != null){
      return 'interface';
    }
    // todo handle outerface
    else{
      return 'node'
    }
  }


}


export class BioxFlow extends BioxConnectionManager {

  @Expose({name: 'experiment_uri'})
  experimentId: string;

  @Expose({name: 'is_running'})
  isRunning: boolean;

  @Expose({name: 'is_finished'})
  isFinished: boolean;

  @Type(() => BioxConfig)
  config: BioxConfig;

  @Type(() => BioxProcessableBase)
  process: BioxProcessableBase;

  @ClRecordTransform(BioxJob)
  jobs: Record<string, BioxJob>;

  @Type(() => BioxFlowStep)
  flows: BioxFlowStep[];

  @ClRecordTransform(BioxFlowInterface)
  interfaces: Record<string, BioxFlowInterface>;

  @ClRecordTransform(BioxFlowInterface)
  outerfaces: Record<string, BioxFlowInterface>;

  layout: Record<string, unknown>;

  // python class link
  type: string;

  @Expose({name: 'creation_datetime'})
  @ClLuxonTransform()
  createdAt: DateTime;

  getAllConnections(): BioxConnection[] {
    return this.flows;
  }

  getNodes(): Record<string, BioxJob> {
    return this.jobs;
  }

  getInterfaces(): Record<string, BioxFlowInterface> {
    return this.interfaces;
  }

  getOuterfaces(): Record<string, BioxFlowInterface> {
    return this.outerfaces;
  }

}

