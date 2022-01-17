import { FlEntity } from '@monorepo/front-core-lib';
import {DateTime} from 'luxon';
import {HaUser} from './ha-user';

export class HaEntity implements FlEntity {
  id: string;
  createdAt: DateTime;
  createdBy: HaUser;
  lastModifiedAt: DateTime;
  lastModifiedBy: HaUser;
}
