import {Any, JsonObject, JsonProperty} from 'json2typescript';
import {LabEntity} from '../global/lab-entity.entity';

/**
 * Config object for a job
 */
@JsonObject('BioxConfig')
export class BioxConfig extends LabEntity {

  // python class link
  @JsonProperty('type', String, true)
  type: string = null;

  @JsonProperty('params', Any)
  params: Record<string, unknown> = null;
}
