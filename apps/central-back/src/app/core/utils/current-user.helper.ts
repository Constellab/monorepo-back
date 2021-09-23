import {BlCurrentUserHelper} from '@monorepo/back-core-lib';
import {User} from '../../users/user.entity';
import {LabInstance} from '../../lab-instances/lab-instance.entity';
import {UnauthorizedException} from '@nestjs/common';

export class CurrentUserHelper extends BlCurrentUserHelper {

  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): User | null {
    return super.getCurrentUser() as User;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): User {
    return super.getAndCheckCurrentUser() as User;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   */
  static getAndCheckCurrentLabInstance(): LabInstance {
    const labInstance: LabInstance = this.getLabInstance();

    if (labInstance == null) {
      throw new UnauthorizedException();
    }

    return labInstance;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   * or null if not authenticated
   */
  static getLabInstance(): LabInstance | null {
    const request = this.getCurrentRequest();
    return (request && request.authInfo as LabInstance) || null;
  }
}
