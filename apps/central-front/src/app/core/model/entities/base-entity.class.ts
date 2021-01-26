import {User} from './user.class';
import {DateTime} from 'luxon';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {Entity} from './entity.entity';
import {Type} from 'class-transformer';

export class BaseEntity extends Entity {

  @ClLuxonTransform()
  createdAt: DateTime;

  @Type(() => User)
  createdBy: User;

  @ClLuxonTransform()
  lastModifiedAt ?: DateTime;

  @Type(() => User)
  lastModifiedBy ?: User;

}
