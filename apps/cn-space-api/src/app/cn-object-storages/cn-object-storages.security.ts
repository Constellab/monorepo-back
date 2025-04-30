import { Injectable } from '@nestjs/common';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnBucketCredentials } from './cn-bucket-credential/cn-bucket-credential.entity';

@Injectable()
export class CnObjectStoragesSecurity {
  constructor() {}

  /**
   * Only a G admin can create, update or delete an object storage object
   * @param user
   */
  public checkAuthorizationToModifyEntity(user: CnUser): void {
    if (!user.isAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * Only a G admin can retrieve generic credentials (not associated to a space)
   * @param user
   */
  public checkAuthorizationForGenericCredentials(user: CnUser): void {
    if (!user.isAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * Only a space admin can retrieve space credentials
   */
  public checkAuthorizationForSpaceCredentials(spaceId: string, userInfo: CnUserSpaceInfo): void {
    if (spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();
    if (!userInfo.isSpaceAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * For a given credentials, check if the user is authorized to retrieve it
   * @param credentials
   * @param userInfo
   */
  public checkAuthorizationForCredentials(credentials: CnBucketCredentials, userInfo: CnUserSpaceInfo): void {
    if (credentials.spaceId != null || credentials.space != null) {
      this.checkAuthorizationForSpaceCredentials(credentials.spaceId ?? credentials.space.id, userInfo);
    } else {
      this.checkAuthorizationForGenericCredentials(userInfo.user);
    }
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
