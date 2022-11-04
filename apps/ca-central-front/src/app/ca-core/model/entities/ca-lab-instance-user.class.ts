import {FlArrayObs} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CaUser} from './ca-user.class';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';

export type CaLabInstanceUserRole = 'OWNER' | 'USER';

/**
 * N - N relation between lab instance and user
 */
export class CaLabInstanceUser {

  @Type(() => CaUser)
  user: CaUser;

  role: CaLabInstanceUserRole;

  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Type(() => CaUser)
  createdBy: CaUser;

  @ClLuxonDateTimeTransform()
  lastModifiedAt ?: DateTime;

  @Type(() => CaUser)
  lastModifiedBy ?: CaUser;
}

export class CaLabInstanceUserDatasource extends FlArrayObs<CaLabInstanceUser> {

  protected equals(a: CaLabInstanceUser, b: CaLabInstanceUser): boolean {
    return a.user.id === b.user.id;
  }

}
