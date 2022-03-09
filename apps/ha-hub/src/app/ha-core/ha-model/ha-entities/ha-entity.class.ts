import { FlEntity } from '@monorepo/front-core-lib';
import {DateTime} from 'luxon';
import {HaUser} from './ha-user';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';

export class HaEntity implements FlEntity {
  id: string;
  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Type(() => HaUser)
  createdBy: HaUser;

  @ClLuxonDateTimeTransform()
  lastModifiedAt: DateTime;

  @Type(() => HaUser)
  lastModifiedBy: HaUser;
}
