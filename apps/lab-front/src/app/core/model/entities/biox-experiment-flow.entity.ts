import {LabEntity} from '../global/lab-entity.entity';
import {Any, JsonConverter, JsonObject, JsonProperty} from 'json2typescript';
import {BioxConfig} from './biox-config.entity';
import {BioxJob} from './biox-job.entity';
import {ClCoreJsonConvert, ClLuxonConverter, ClRecordConverter} from '@monorepo/core-lib';
import {BioxConnection, BioxConnectionManager, BioxConnectionPart} from '../global/biox-connection.class';
import {DateTime} from 'luxon';
import {BioxProcessableBase} from '../global/biox-processable-base.class';


/**
 * Converter for the flow jobs
 */
@JsonConverter
export class BioxJobsConverter extends ClRecordConverter<BioxJob> {

  deserializeItem(item: any): BioxJob {
    return ClCoreJsonConvert.deserializeObject(item, BioxJob);
  }
}

@JsonObject('BioxExperimentFlowProcess')
export class BioxExperimentFlowProcess extends LabEntity {
  @JsonProperty('port', String)
  port: string = null;

  @JsonProperty('instance_name', String)
  instanceName: string = null;

}

@JsonObject('BioxExperimentFlowJob')
export class BioxExperimentFlowJob implements BioxConnectionPart {

  @JsonProperty('job_uri', String)
  jobId: string = null;

  @JsonProperty('process', BioxExperimentFlowProcess)
  process: BioxExperimentFlowProcess = null;

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
@JsonObject('BioxExperimentFlowStep')
export class BioxExperimentFlowStep implements BioxConnection {

  @JsonProperty('from', BioxExperimentFlowJob)
  from: BioxExperimentFlowJob = null;

  @JsonProperty('to', BioxExperimentFlowJob)
  to: BioxExperimentFlowJob = null;

  @JsonProperty('resource_uri', String)
  resourceId: boolean = null;
}


@JsonObject('BioxExperimentFlow')
export class BioxExperimentFlow extends BioxConnectionManager {

  @JsonProperty('experiment_uri', String, true)
  experimentId: string = null;

  @JsonProperty('is_running', Boolean)
  isRunning: boolean = null;

  @JsonProperty('is_finished', Boolean)
  isFinished: boolean = null;

  @JsonProperty('config', BioxConfig)
  config: BioxConfig = null;

  @JsonProperty('process', BioxProcessableBase)
  process: BioxProcessableBase = null;

  @JsonProperty('jobs', BioxJobsConverter)
  jobs: Record<string, BioxJob> = null;

  @JsonProperty('flows', [BioxExperimentFlowStep])
  flows: BioxExperimentFlowStep[] = null;

  @JsonProperty('interfaces', Any)
  interfaces: Record<string, unknown> = null;

  @JsonProperty('outerfaces', Any)
  outerfaces: Record<string, unknown> = null;

  @JsonProperty('layout', Any)
  layout: Record<string, unknown> = null;

  // python class link
  @JsonProperty('type', String, true)
  type: string = null;

  @JsonProperty('creation_datetime', ClLuxonConverter, true)
  createdAt: DateTime = null;

  getConnections(): BioxConnection[] {
    return this.flows;
  }

  getNodes(): Record<string, BioxJob> {
    return this.jobs;
  }


}

