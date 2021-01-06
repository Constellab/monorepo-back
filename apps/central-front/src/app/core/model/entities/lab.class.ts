import {BaseEntity} from './base-entity.class';
import {JsonObject, JsonProperty} from 'json2typescript';

@JsonObject('Lab')
export class Lab extends BaseEntity {

  @JsonProperty('label', String)
  label: string = null;
}
