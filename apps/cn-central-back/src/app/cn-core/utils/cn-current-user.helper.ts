import { BlRequestContextHelper, BlUnauthorizedException, BlUser } from '@monorepo/back-core-lib';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnLab } from '../../cn-labs/cn-lab.entity';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnSpaceUserRole } from '../../cn-spaces/cn-space-user.entity';
import { CnUserSpaceInfo } from '../../cn-users/cn-user.dto';
import { Request } from 'express';

/**
 * Auth context when the user is authenticated but there is no space (it should not happen)
 */
export interface CnAuthContextUserNoSpace {
  type: 'userNoSpace';
  user: CnUser;
}

/**
 * Main Auth context when the user is authenticated and is in a space
 */
export interface CnAuthContextUser {
  type: 'user';
  user: CnUser;
  space: CnSpace;
  roleInSpace: CnSpaceUserRole;
}

/**
 * Auth for request comming from the lab.
 * labProd if the request is made from the production environment (prod api)
 * labDev if the request is made from the development environment (dev api from codelab)
 *
 * labApi if the request is made from the lab api // TODO TO IMPRVOVE
 */
export interface CnAuthContextLab {
  type: 'labProd' | 'labDev' | 'labApi';
  user: CnUser;
  space: CnSpace;
  roleInSpace: CnSpaceUserRole;

  lab: CnLab;
}

/**
 * LabManager if the request is made from the lab manager
 */
export interface CnAuthContextLabManager {
  type: 'labManager';
  user: CnUser;
  space: CnSpace;
  roleInSpace: CnSpaceUserRole;

  lab: CnLab;
  labManagerVersion: string;
}

/**
 * Auth for cron jobs
 */
export interface CnAuthContextCron {
  type: 'cron';
  user: CnUser;
}

/**
 * Object representing all the possible auth context
 */
export type CnAuthContext =
  | CnAuthContextUser
  | CnAuthContextUserNoSpace
  | CnAuthContextLab
  | CnAuthContextLabManager
  | CnAuthContextCron;

export type CnRequest = Request & {
  user?: CnUser;
};

/**
 * Additional info that can be added to the request
 */
export interface CnRequestAuthAdditionalData {
  // when provided it will override the auth context
  authOverride?: CnAuthContext;
}

export class CnCurrentUserHelper extends BlRequestContextHelper {
  private static robotUser: BlUser | null = null;

  public static setAuthContext(content: CnAuthContext): void {
    super.setAuthContent(content);
  }

  protected static getAuthContext(): CnAuthContext {
    const context = super.getCurrentContext();

    // if there is no request and a manual user is set, return it
    // this is used for cron jobs
    if (context == null && this.robotUser != null) {
      return { type: 'cron', user: this.robotUser } as CnAuthContextCron;
    }

    const authOverride = this.getAdditionalInfo()?.authOverride;
    if (authOverride) {
      return authOverride;
    }

    return super.getAuthContent() as CnAuthContext;
  }

  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): CnUser | null {
    const authContext = this.getAuthContext();

    if (authContext) {
      return authContext.user;
    }
    return null;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): CnUser {
    const user = this.getCurrentUser();

    if (user == null) {
      throw new BlUnauthorizedException('No user in the context');
    }

    return user;
  }

  /**
   * returns the current authenticated lab for routes annotated with @LabAuth
   */
  static getAndCheckCurrentLab(): CnLab {
    const lab = this.getCurrentLab();

    if (lab == null) {
      throw new BlUnauthorizedException('No lab in the context');
    }

    return lab;
  }

  /**
   * returns the current authenticated lab for routes annotated with @LabAuth
   * or null if not authenticated
   */
  static getCurrentLab(): CnLab | null {
    const authContext = this.getAuthContext();

    if (authContext == null) return null;

    if (
      authContext.type === 'labProd' ||
      authContext.type === 'labDev' ||
      authContext.type === 'labManager' ||
      authContext.type === 'labApi'
    ) {
      return authContext.lab;
    }

    return null;
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
    const authContext = this.getAuthContext();

    if (authContext == null) return null;

    if (
      authContext.type === 'user' ||
      authContext.type === 'labProd' ||
      authContext.type === 'labDev' ||
      authContext.type === 'labManager' ||
      authContext.type === 'labApi'
    ) {
      return authContext.space;
    }

    return null;
  }

  /**
   * Override the auth in the context
   * /!\ Always call clearAuthOverride after using this method
   */
  public static overrideAuth(content: CnAuthContext): void {
    this.setAdditionalData('authOverride', content);
  }

  public static clearAuthOverride(): void {
    this.setAdditionalData('authOverride', null);
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
    const authContext = this.getAuthContext();

    if (authContext == null || authContext.type === 'userNoSpace' || authContext.type === 'cron') return null;
    return authContext.roleInSpace;
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

  static getAdditionalInfo(): CnRequestAuthAdditionalData | null {
    return this.getCurrentAdditionalData();
  }

  /**
   * Default user used when no request is in the context (cron jobs)
   * @param user
   */
  public static setRobotUser(user: BlUser | null): void {
    CnCurrentUserHelper.robotUser = user;
  }
}
