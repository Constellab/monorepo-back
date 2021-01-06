import {JsonObject, JsonProperty} from 'json2typescript';
import {MomentConverter} from '../../utils/json-converter';
import {Moment} from 'moment';
import {Entity} from './entity.entity';
import {User} from './user.class';

@JsonObject('BaseEntity')
export class BaseEntity extends Entity {

  @JsonProperty('id', String, true)
  id: string = null;

  @JsonProperty('createdAt', MomentConverter, true)
  createdAt: Moment = null;

  @JsonProperty('createdBy', User, true)
  createdBy: User = null;

  @JsonProperty('lastModifiedAt', MomentConverter, true)
  lastModifiedAt ?: Moment = null;

  @JsonProperty('lastModifiedBy', User, true)
  lastModifiedBy ?: User = null;

}
