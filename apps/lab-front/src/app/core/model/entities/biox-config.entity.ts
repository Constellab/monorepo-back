import {Any, JsonObject, JsonProperty} from 'json2typescript';
import {LabEntity} from '../global/lab-entity.entity';

/**
 * Config object for a job
 */
@JsonObject('BioxConfig')
export class BioxConfig extends LabEntity {

  // python class link
  @JsonProperty('type', String, true)
  type: 'gws.model.Config' = null;

  @JsonProperty('params', Any)
  params: Record<string, unknown> = null;

  public static empty(): BioxConfig {
    const config = new BioxConfig();
    config.type = 'gws.model.Config';
    return config;
  }
}
