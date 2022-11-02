import {CaUser} from './ca-user.class';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {CaEntity} from './ca-entity.entity';
import {Type} from 'class-transformer';

export class CaBaseEntity extends CaEntity {

  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Type(() => CaUser)
  createdBy: CaUser;

  @ClLuxonDateTimeTransform()
  lastModifiedAt ?: DateTime;

  @Type(() => CaUser)
  lastModifiedBy ?: CaUser;

}
