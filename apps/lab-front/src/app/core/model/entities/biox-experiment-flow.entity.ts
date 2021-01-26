import {LabEntity} from '../global/lab-entity.entity';
import {BioxConfig} from './biox-config.entity';
import {BioxJob} from './biox-job.entity';
import {ClLuxonTransform, ClRecordTransform} from '@monorepo/core-lib';
import {BioxConnection, BioxConnectionManager, BioxConnectionPart} from '../global/biox-connection.class';
import {DateTime} from 'luxon';
import {BioxProcessableBase} from './biox-processable-base.entity';
import {Expose, Type} from 'class-transformer';


export class BioxExperimentFlowProcess extends LabEntity {
  port: string;

  @Expose({name: 'instance_name'})
  instanceName: string;
}

export class BioxExperimentFlowJob implements BioxConnectionPart {

  @Expose({name: 'job_uri'})
  jobId: string;

  @Type(() => BioxExperimentFlowProcess)
  process: BioxExperimentFlowProcess;

  job: BioxJob;

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
export class BioxExperimentFlowStep implements BioxConnection {

  @Type(() => BioxExperimentFlowJob)
  from: BioxExperimentFlowJob;

  @Type(() => BioxExperimentFlowJob)
  to: BioxExperimentFlowJob;

  @Expose({name: 'resource_uri'})
  resourceId: boolean;
}


export class BioxExperimentFlow extends BioxConnectionManager {

  @Expose({name: 'experiment_uri'})
  experimentId: string = null;

  @Expose({name: 'is_running'})
  isRunning: boolean = null;

  @Expose({name: 'is_finished'})
  isFinished: boolean = null;

  @Type(() => BioxConfig)
  config: BioxConfig = null;

  @Type(() => BioxProcessableBase)
  process: BioxProcessableBase = null;

  @ClRecordTransform(BioxJob)
  jobs: Record<string, BioxJob> = null;

  @Type(() => BioxExperimentFlowStep)
  flows: BioxExperimentFlowStep[] = null;

  interfaces: Record<string, unknown> = null;

  outerfaces: Record<string, unknown> = null;

  layout: Record<string, unknown> = null;

  // python class link
  type: string = null;

  @Expose({name: 'creation_datetime'})
  @ClLuxonTransform()
  createdAt: DateTime = null;

  getConnections(): BioxConnection[] {
    return this.flows;
  }

  getNodes(): Record<string, BioxJob> {
    return this.jobs;
  }


}

