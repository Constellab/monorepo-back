import {JsonObject, JsonProperty} from 'json2typescript';
import {LuxonConverter} from '../../utils/json-converter';
import {Entity} from './entity.entity';
import {User} from './user.class';
import {DateTime} from 'luxon';

@JsonObject('BaseEntity')
export class BaseEntity extends Entity {

  @JsonProperty('id', String, true)
  id: string = null;

  @JsonProperty('createdAt', LuxonConverter, true)
  createdAt: DateTime = null;

  @JsonProperty('createdBy', User, true)
  createdBy: User = null;

  @JsonProperty('lastModifiedAt', LuxonConverter, true)
  lastModifiedAt ?: DateTime = null;

  @JsonProperty('lastModifiedBy', User, true)
  lastModifiedBy ?: User = null;

}
