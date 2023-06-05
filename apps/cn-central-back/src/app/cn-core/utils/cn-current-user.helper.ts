import {BlCurrentUserHelper, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabInstance} from '../../cn-lab-instances/cn-lab-instance.entity';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
import {CnSpaceUserRole} from '../../cn-spaces/cn-space-user.entity';
import {CnUserSpaceInfo} from '../../cn-users/cn-user.dto';

export interface CnRequestAuthInfo {
  labInstance?: CnLabInstance;
  space?: CnSpace;
  // role for the current user in this space
  roleInSpace: CnSpaceUserRole;
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
      throw new BlUnauthorizedException("No labInstance in the context");
    }

    return labInstance;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   * or null if not authenticated
   */
  static getCurrentLabInstance(): CnLabInstance | null {
    return this.getAdditionalInfo()?.labInstance ?? null;
  }

  static setCurrentLabInstance(labInstance: CnLabInstance): void {
    this.setAdditionalData('labInstance', labInstance);
  }

  /**
   * return the current space or throw an Unauthorized exception
   * if there is no space in the context
   */
  static getAndCheckCurrentSpace(): CnSpace {
    const space: CnSpace = this.getCurrentSpace();

    if (space == null) {
      throw new BlUnauthorizedException("No space in the context");
    }

    return space;
  }

  /**
   * return the current space or null if there is no space in the context
   */
  static getCurrentSpace(): CnSpace | null {
    return this.getAdditionalInfo()?.space ?? null;
  }

  static setCurrentSpace(space: CnSpace): void {
    this.setAdditionalData('space', space);
  }

  /**
   * return the role of the current user for the current space
   */
  static getAndCheckCurrentRoleInSpace(): CnSpaceUserRole {
    const role: CnSpaceUserRole = this.getCurrentRoleInSpace();

    if (role == null) {
      throw new BlUnauthorizedException("No role in the context");
    }

    return role;
  }

  /**
   * return the role of the current user for the current space
   * or null if there is no space in the context
   */
  static getCurrentRoleInSpace(): CnSpaceUserRole | null {
    return this.getAdditionalInfo()?.roleInSpace ?? null;
  }

  static isAdminOfCurrentSpace(): boolean {
    return this.getAndCheckCurrentRoleInSpace() === CnSpaceUserRole.ADMIN;
  }

  static isAdmin(): boolean{
    return this.getAndCheckCurrentUser().isAdmin();
  }

  static setCurrentRoleInSpace(role: CnSpaceUserRole): void {
    this.setAdditionalData('roleInSpace', role);
  }

  static getAndCheckUserSpaceInfo(): CnUserSpaceInfo {
    return new CnUserSpaceInfo(this.getAndCheckCurrentUser(),
      this.getAndCheckCurrentSpace(),
      this.getAndCheckCurrentRoleInSpace());
  }


  static getAdditionalInfo(): CnRequestAuthInfo | null {
    return this.getCurrentAdditionalData();
  }
}
