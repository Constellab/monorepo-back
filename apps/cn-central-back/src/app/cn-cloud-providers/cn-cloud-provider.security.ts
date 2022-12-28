import {Injectable} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';
import {BlUnauthorizedException} from '@monorepo/back-core-lib';


@Injectable()
export class CnCloudProviderSecurity {


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
   * All user can retrieve object storages entities
   */
  public checkAuthorizationToGetEntity(): void {
    return;
  }
}
