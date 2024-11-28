import { BlCurrentUserHelper, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnLabWithSpace } from '../../cn-labs/cn-lab.entity';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnSpaceUserRole } from '../../cn-spaces/cn-space-user.entity';
import { CnUserSpaceInfo } from '../../cn-users/cn-user.dto';
import { cnExternalLabManagerVersionHeader } from '../model/config/cn-config.class';

export interface CnRequestAuthInfo {
  lab?: CnLabWithSpace;
  labEnvironment?: CnCurrentLabEnvironment;
  space?: CnSpace;
  // role for the current user in this space
  roleInSpace: CnSpaceUserRole;

  // overrides
  spaceOverride?: CnSpace;
  roleInSpaceOverride?: CnSpaceUserRole;
}

export enum CnCurrentLabEnvironment {
  DEV = 'DEV',
  PROD = 'PROD',
  LAB_MANAGER = 'LAB_MANAGER',
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
   * returns the current authenticated lab for routes annotated with @LabAuth
   */
  static getAndCheckCurrentLab(): CnLabWithSpace {
    const lab: CnLabWithSpace = this.getCurrentLab();

    if (lab == null) {
      throw new BlUnauthorizedException('No lab in the context');
    }

    return lab;
  }

  /**
   * returns the current authenticated lab for routes annotated with @LabAuth
   * or null if not authenticated
   */
  static getCurrentLab(): CnLabWithSpace | null {
    return this.getAdditionalInfo()?.lab ?? null;
  }

  static setCurrentLab(lab: CnLabWithSpace, environment: CnCurrentLabEnvironment): void {
    this.setAdditionalData('lab', lab);
    this.setAdditionalData('labEnvironment', environment);
  }

  /**
   * return the current lab environment or null if there is no lab in the context
   * Prod if the request is made from the production environment (prod api)
   * Dev if the request is made from the development environment (dev api from codelab)
   * LabManager if the request is made from the lab manager
   */
  static getCurrentLabEnvironment(): CnCurrentLabEnvironment | null {
    return this.getAdditionalInfo()?.labEnvironment ?? null;
  }

  /**
   * return the current space or throw an Unauthorized exception
   * if there is no space in the context
   */
  static getAndCheckCurrentSpace(): CnSpace {
    const space: CnSpace = this.getCurrentSpace();

    if (space == null) {
      throw new BlUnauthorizedException('No space in the context');
    }

    return space;
  }

  /**
   * return the current space or null if there is no space in the context
   */
  static getCurrentSpace(): CnSpace | null {
    if (this.getAdditionalInfo()?.spaceOverride) {
      return this.getAdditionalInfo().spaceOverride;
    }
    return this.getAdditionalInfo()?.space ?? null;
  }

  static setCurrentSpace(space: CnSpace): void {
    this.setAdditionalData('space', space);
  }

  /**
   * Override the space in the context
   * /!\ Always call clearSpaceOverride after using this method
   */
  public static overrideSpace(space: CnSpace | null): void {
    this.setAdditionalData('spaceOverride', space);
  }

  public static clearSpaceOverride(): void {
    this.setAdditionalData('spaceOverride', null);
  }

  /**
   * return the role of the current user for the current space
   */
  static getAndCheckCurrentRoleInSpace(): CnSpaceUserRole {
    const role: CnSpaceUserRole = this.getCurrentRoleInSpace();

    if (role == null) {
      throw new BlUnauthorizedException('No role in the context');
    }

    return role;
  }

  /**
   * return the role of the current user for the current space
   * or null if there is no space in the context
   */
  static getCurrentRoleInSpace(): CnSpaceUserRole | null {
    if (this.getAdditionalInfo()?.roleInSpaceOverride) {
      return this.getAdditionalInfo().roleInSpaceOverride;
    }
    return this.getAdditionalInfo()?.roleInSpace ?? null;
  }

  static setCurrentRoleInSpace(role: CnSpaceUserRole): void {
    this.setAdditionalData('roleInSpace', role);
  }

  /**
   * Override the user role in space in the context
   * /!\ Always call clearRoleInSpaceOverride after using this method
   */
  public static overrideRoleInSpace(role: CnSpaceUserRole): void {
    this.setAdditionalData('roleInSpaceOverride', role);
  }

  public static clearRoleInSpaceOverride(): void {
    this.setAdditionalData('roleInSpaceOverride', null);
  }

  static isAdminOfCurrentSpace(): boolean {
    return this.getAndCheckCurrentRoleInSpace() === CnSpaceUserRole.ADMIN;
  }

  static isAdmin(): boolean {
    return this.getAndCheckCurrentUser().isAdmin();
  }

  static getAndCheckUserSpaceInfo(): CnUserSpaceInfo {
    return new CnUserSpaceInfo(
      this.getAndCheckCurrentUser(),
      this.getAndCheckCurrentSpace(),
      this.getAndCheckCurrentRoleInSpace()
    );
  }

  static getAdditionalInfo(): CnRequestAuthInfo | null {
    return this.getCurrentAdditionalData();
  }

  /**
   * Only for request coming from the lab manager
   * Use to access the version of the lab manager that made the request
   */
  static getLabManagerVersion(): string {
    return this.getHeaderFromContext(cnExternalLabManagerVersionHeader);
  }
}
