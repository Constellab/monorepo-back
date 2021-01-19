import {JsonObject, JsonProperty} from 'json2typescript';
import {FlEntity} from '@monorepo/front-core-lib';
import {ClLuxonConverter} from '@monorepo/core-lib';
import {DateTime} from 'luxon';

/**
 * Base entity for the lab entities
 */
@JsonObject('LabEntity')
export class LabEntity implements FlEntity {

  @JsonProperty('uri', String, true)
  id: string = null;

}

/**
 * Base entity for the lab entities
 */
@JsonObject('LabBaseEntity')
export class LabBaseEntity extends LabEntity{

  // python class link
  @JsonProperty('type', String, true)
  type: string = null;

  @JsonProperty('creation_datetime', ClLuxonConverter, true)
  createdAt: DateTime = null;

}
