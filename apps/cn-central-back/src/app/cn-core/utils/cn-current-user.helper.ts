import {BlCurrentUserHelper} from '@monorepo/back-core-lib';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabInstance} from '../../cn-lab-instances/cn-lab-instance.entity';
import {UnauthorizedException} from '@nestjs/common';

export class CnCurrentUserHelper extends BlCurrentUserHelper {

  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): CnUser | null {
    return super.getCurrentUser() as CnUser;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): CnUser {
    return super.getAndCheckCurrentUser() as CnUser;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   */
  static getAndCheckCurrentLabInstance(): CnLabInstance {
    const labInstance: CnLabInstance = this.getLabInstance();

    if (labInstance == null) {
      throw new UnauthorizedException();
    }

    return labInstance;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   * or null if not authenticated
   */
  static getLabInstance(): CnLabInstance | null {
    const request = this.getCurrentRequest();
    return (request && request.authInfo as CnLabInstance) || null;
  }
}
