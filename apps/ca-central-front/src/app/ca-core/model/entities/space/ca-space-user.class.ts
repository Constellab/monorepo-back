import {Type} from 'class-transformer';
import {CaUser} from '../ca-user.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';

export enum CaSpaceRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class CaSpaceUser {

  role: CaSpaceRole;

  active: boolean;

  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Type(() => CaUser)
  addedBy: CaUser;

  @Type(() => CaUser)
  user: CaUser;
}

export class CaSpaceUserDatasource extends FlDatasourcePaginated<CaSpaceUser> {

  protected equals(a: CaSpaceUser, b: CaSpaceUser): boolean {
    return a.user.id === b.user.id;
  }
}
