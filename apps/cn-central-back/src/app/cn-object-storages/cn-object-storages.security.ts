import {Injectable} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnUserSpaceInfo} from '../cn-users/cn-user-space-info.dto';
import {BlUnauthorizedException} from '@monorepo/back-core-lib';


@Injectable()
export class CnObjectStoragesSecurity {


  constructor() {
  }

  /**
   * Only a G admin can create, update or delete an object storage object
   * @param user
   */
  public checkAuthorizationToModifyEntity(user: CnUser): void {
    if (!user.isAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * Only a G admin can retrieve credentials
   * @param user
   */
  public checkAuthorizationToGetCredentials(user: CnUser): void {
    if (!user.isAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * All user can retrieve object storages entities
   */
  public checkAuthorizationToGetEntity(): void {
    return;
  }

  public checkAuthorizationToGetBucket(spaceId: string, userInfo: CnUserSpaceInfo): void {
    // check the space context
    if (spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    if (!userInfo.isSpaceAdmin()) throw new BlUnauthorizedException();
  }

  public checkAuthorizationToGetAllBuckets(user: CnUser): void {
    if (!user.isAdmin()) throw new BlUnauthorizedException();
  }
}
