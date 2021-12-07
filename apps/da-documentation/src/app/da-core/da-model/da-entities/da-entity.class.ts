import { FlEntity } from '@monorepo/front-core-lib';
import {DateTime} from 'luxon';
import {DaUser} from './da-user';

export class DaEntity implements FlEntity {
  id: string;
  createdAt: DateTime;
  createdBy: DaUser;
  lastModifiedAt: DateTime;
  lastModifiedBy: DaUser;
}
