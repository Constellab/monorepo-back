import {JsonObject, JsonProperty} from 'json2typescript';
import {FlEntity} from '@monorepo/front-core-lib';

/**
 * Base entity for the lab entities
 */
@JsonObject('LabEntity')
export class LabEntity implements FlEntity {

  @JsonProperty('uri', String, true)
  id: string = null;

}
