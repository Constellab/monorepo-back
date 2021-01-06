import {BaseEntity} from './base-entity.class';
import {JsonObject, JsonProperty} from 'json2typescript';

@JsonObject('Organization')
export class Organization extends BaseEntity{

  @JsonProperty('name', String)
  name: string = null;
}

