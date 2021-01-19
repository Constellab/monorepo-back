import {LabBaseEntity} from '../global/lab-entity.entity';
import {JsonObject, JsonProperty} from 'json2typescript';
import {BioxConfig} from './biox-config.entity';
import {BioxProcessableBase} from '../global/biox-processable.class';


/**
 * Executed or ready to be executed process of a job
 */
@JsonObject('BioxJob')
export class BioxJob extends LabBaseEntity {

  // python class link
  @JsonProperty('type', String, true)
  type: 'gws.model.Job' = null;

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
}
