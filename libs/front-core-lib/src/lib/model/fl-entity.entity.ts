import {JsonObject, JsonProperty} from 'json2typescript';

@JsonObject('FlEntity')
export class FlEntity {

  @JsonProperty('id', String, true)
  id: string = null;

}
