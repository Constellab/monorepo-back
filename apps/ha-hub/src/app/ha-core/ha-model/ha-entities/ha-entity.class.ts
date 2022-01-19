import { FlEntity } from '@monorepo/front-core-lib';
import {DateTime} from 'luxon';
import {HaUser} from './ha-user';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {Type} from 'class-transformer';

export class HaEntity implements FlEntity {
  id: string;
  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  createdBy: HaUser;
  @ClLuxonDateTimeTransform()
  lastModifiedAt: DateTime;

  lastModifiedBy: HaUser;
}
