import {CaUser} from './ca-user.class';
import {DateTime} from 'luxon';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {CaEntity} from './ca-entity.entity';
import {Type} from 'class-transformer';

export class CaBaseEntity extends CaEntity {

  @ClLuxonTransform()
  createdAt: DateTime;

  @Type(() => CaUser)
  createdBy: CaUser;

  @ClLuxonTransform()
  lastModifiedAt ?: DateTime;

  @Type(() => CaUser)
  lastModifiedBy ?: CaUser;

}
