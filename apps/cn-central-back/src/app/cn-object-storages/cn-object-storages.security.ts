import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnUserOrgaInfo} from '../cn-users/cn-user.dto';


@Injectable()
export class CnObjectStoragesSecurity {


  constructor() {
  }

  /**
   * Only a G admin can create, update or delete an object storage object
   * @param user
   */
  public checkAuthorizationToModifyEntity(user: CnUser): void {
    if (!user.isAdmin()) throw new UnauthorizedException();
  }

  /**
   * Only a G admin can retrieve credentials
   * @param user
   */
  public checkAuthorizationToGetCredentials(user: CnUser): void {
    if (!user.isAdmin()) throw new UnauthorizedException();
  }

  /**
   * All user can retrieve object storages entities
   */
  public checkAuthorizationToGetEntity(): void {
    return;
  }

  public checkAuthorizationToGetBucket(organizationId: string, userInfo: CnUserOrgaInfo): void {
    // check the organization context
    if (organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    if (!userInfo.isOrganizationAdmin()) throw new UnauthorizedException();
  }

  public checkAuthorizationToGetAllBuckets(user: CnUser): void {
    if (!user.isAdmin()) throw new UnauthorizedException();
  }
}
