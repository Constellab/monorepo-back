import {JsonObject, JsonProperty} from 'json2typescript';

@JsonObject('Entity')
export class Entity {

  @JsonProperty('id', String, true)
  id: string = null;

}
