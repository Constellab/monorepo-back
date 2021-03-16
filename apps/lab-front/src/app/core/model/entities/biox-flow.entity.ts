import {LabEntity} from '../global/lab-entity.entity';
import {BioxConfig} from './biox-config.entity';
import {BioxJob} from './biox-job.entity';
import {ClLuxonTransform, ClRecordTransform} from '@monorepo/core-lib';
import {BioxConnection, BioxConnectionManager, BioxConnectionPart, BioxConnectionType} from '../global/biox-connection.class';
import {DateTime} from 'luxon';
import {Expose, Type} from 'class-transformer';
import {BioxResourceVM} from './biox-resource.entity';
import {FlLazyProperty, FlLazyPropertyTransform} from '@monorepo/front-core-lib';
import {BioxResourceService} from '../../entity-service/biox-resource.service';
import {BioxFlowInterface, BioxFlowOuterface} from './biox-inteface.entity';
import {BioxProcessableBase} from './biox-processable-base.entity';

/**
 * Process object under flow
 */
export class BioxProcessableFlow extends BioxProcessableBase {
  @ClRecordTransform(BioxFlowInterface)
  interfaces: Record<string, BioxFlowInterface>;

  @ClRecordTransform(BioxFlowOuterface)
  outerfaces: Record<string, BioxFlowOuterface>;
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
  resource: FlLazyProperty<BioxResourceVM>;

  getType(): BioxConnectionType {
    if (this.from.interface != null) {
      return 'interface';
    }
    // todo delete when interface are not in connection anymore
    else {
      return 'node';
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

  @Type(() => BioxProcessableFlow)
  process: BioxProcessableFlow;

  @ClRecordTransform(BioxJob)
  jobs: Record<string, BioxJob>;

  @Type(() => BioxFlowStep)
  flows: BioxFlowStep[];


  layout: Record<string, unknown>;

  // python class link
  type: string;

  @Expose({name: 'creation_datetime'})
  @ClLuxonTransform()
  createdAt: DateTime;

  getConnections(): BioxConnection[] {
    return this.flows;
  }

  getNodes(): Record<string, BioxJob> {
    return this.jobs;
  }

  getInputSpecs(): Record<string, string[]> {
    return this.process.getInputSpecs();
  }

  getOutputSpecs(): Record<string, string[]> {
    return this.process.getOutputSpecs();
  }

  getInterfacesConnections(): Record<string, BioxFlowInterface> {
    return this.process.interfaces;
  }

  getOuterfacesConnections(): Record<string, BioxFlowInterface> {
    return this.process.outerfaces;
  }

}

