import {JsonObject, JsonProperty} from 'json2typescript';
import {FlEntity} from '@monorepo/front-core-lib';

@JsonObject('Entity')
export class Entity implements FlEntity{

  @JsonProperty('id', String, true)
  id: string = null;

}
