import {LabBaseEntity, LabEntity} from '../global/lab-entity.entity';
import {Any, JsonConverter, JsonObject, JsonProperty} from 'json2typescript';
import {BioxConfig} from './biox-config.entity';
import {BioxJob} from './biox-job.entity';
import {BioxProcessableBase} from '../global/biox-processable.class';
import {ClCoreJsonConvert, ClRecordConverter} from '@monorepo/core-lib';


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
export class BioxExperimentFlowJob {

  @JsonProperty('job_uri', String)
  jobId: string = null;

  @JsonProperty('process', BioxExperimentFlowProcess)
  process: string = null;
}

@JsonObject('BioxExperimentFlowStep')
export class BioxExperimentFlowStep {

  @JsonProperty('from', BioxExperimentFlowJob)
  from: BioxExperimentFlowJob = null;

  @JsonProperty('to', BioxExperimentFlowJob)
  to: BioxExperimentFlowJob = null;

  @JsonProperty('resource_uri', String)
  resourceId: boolean = null;
}


@JsonObject('BioxExperimentFlow')
export class BioxExperimentFlow extends LabBaseEntity {

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
}

