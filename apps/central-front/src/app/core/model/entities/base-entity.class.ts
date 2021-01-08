import {JsonObject, JsonProperty} from 'json2typescript';
import {User} from './user.class';
import {DateTime} from 'luxon';
import {ClLuxonConverter} from '@monorepo/core-lib';
import {FlEntity} from '@monorepo/front-core-lib';

@JsonObject('BaseEntity')
export class BaseEntity extends FlEntity {

  @JsonProperty('id', String, true)
  id: string = null;

  @JsonProperty('createdAt', ClLuxonConverter, true)
  createdAt: DateTime = null;

  @JsonProperty('createdBy', User, true)
  createdBy: User = null;

  @JsonProperty('lastModifiedAt', ClLuxonConverter, true)
  lastModifiedAt ?: DateTime = null;

  @JsonProperty('lastModifiedBy', User, true)
  lastModifiedBy ?: User = null;

}
