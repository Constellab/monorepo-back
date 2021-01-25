import {JsonObject, JsonProperty} from 'json2typescript';
import {BioxConfig} from './biox-config.entity';
import {BioxProcessableBase} from './biox-processable-base.entity';
import {ClLuxonConverter} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BioxNode} from '../global/biox-connection.class';


/**
 * Executed or ready to be executed process of a job
 */
@JsonObject('BioxJob')
export class BioxJob extends BioxNode {

  // python class link
  @JsonProperty('type', String, true)
  type: 'gws.model.Job' = null;

  @JsonProperty('creation_datetime', ClLuxonConverter, true)
  createdAt: DateTime = null;

  @JsonProperty('is_running', Boolean)
  isRunning: boolean = null;

  @JsonProperty('is_finished', Boolean)
  isFinished: boolean = null;

  @JsonProperty('experiment_uri', String, true)
  experimentId: string = null;

  @JsonProperty('parent_job_uri', String, true)
  parentJobId: string = null;

  @JsonProperty('config', BioxConfig)
  config: BioxConfig = null;

  @JsonProperty('process', BioxProcessableBase)
  process: BioxProcessableBase = null;

  public static fromProcessable(processable: BioxProcessableBase,
                                experimentId: string, parentJobId: string): BioxJob {
    const job: BioxJob = new BioxJob();
    job.type = 'gws.model.Job';
    job.isRunning = false;
    job.isFinished = false;
    job.process = processable;
    job.experimentId = experimentId;
    job.parentJobId = parentJobId;
    job.config = BioxConfig.empty();
    job.name = processable.name;

    return job;
  }
}
