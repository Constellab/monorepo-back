import {BlCurrentUserHelper} from '@monorepo/back-core-lib';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabInstance} from '../../cn-lab-instances/cn-lab-instance.entity';
import {UnauthorizedException} from '@nestjs/common';
import {CnOrganization} from '../../cn-organizations/cn-organization.entity';

export interface CnRequestAuthInfo {
  labInstance?: CnLabInstance;
  organization?: CnOrganization;
}

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
    const labInstance: CnLabInstance = this.getCurrentLabInstance();

    if (labInstance == null) {
      throw new UnauthorizedException();
    }

    return labInstance;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   * or null if not authenticated
   */
  static getCurrentLabInstance(): CnLabInstance | null {
    const request = this.getCurrentRequest();
    const authInfo: CnRequestAuthInfo = request.authInfo as CnRequestAuthInfo;
    return authInfo?.labInstance ?? null;
  }

  /**
   * return the current organization or throw an Unauthorized exception
   * if there is no organization in the context
   */
  static getAndCheckCurrentOrganization(): CnOrganization {
    const organization: CnOrganization = this.getCurrentOrganization();

    if (organization == null) {
      throw new UnauthorizedException();
    }

    return organization;
  }

  /**
   * return the current organization or null if there is no organization in the context
   */
  static getCurrentOrganization(): CnOrganization | null {
    const request = this.getCurrentRequest();
    const authInfo: CnRequestAuthInfo = request.authInfo as CnRequestAuthInfo;
    return authInfo?.organization ?? null;
  }
}
