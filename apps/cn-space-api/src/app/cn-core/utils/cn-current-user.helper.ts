import { BlRequestContextHelper, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Request } from 'express';

import { CnLab } from '../../cn-labs/cn-lab.entity';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnSpaceUserRole } from '../../cn-spaces/cn-space-user.entity';
import { CnUserSpaceInfo } from '../../cn-users/cn-user.dto';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnAuthContext, CnAuthContextCron } from './cn-auth-context.class';

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
  private static robotUser: CnUser | null = null;

  public static setAuthContext(content: CnAuthContext): void {
    super.setAuthContent(content);
  }

  protected static getAuthContext(): CnAuthContext | null {
    const context = super.getCurrentContext();

    // if there is no request and a manual user is set, return it
    // this is used for cron jobs
    if (context == null && this.robotUser != null) {
      return new CnAuthContextCron(this.robotUser);
    }

    const authOverride = this.getAdditionalInfo()?.authOverride;
    if (authOverride) {
      return authOverride;
    }

    return super.getAuthContent() as CnAuthContext;
  }

  public static getAndCheckAuthContext(): CnAuthContext {
    const context = this.getAuthContext();

    if (context == null) {
      throw new BlUnauthorizedException('No auth context in the request');
    }

    return context;
  }

  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): CnUser | null {
    const authContext = this.getAuthContext();

    if (authContext == null) return null;

    return authContext.getUser();
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
   * or null if not authenticated
   */
  static getCurrentLab(): CnLab | null {
    const authContext = this.getAuthContext();

    if (authContext == null) return null;

    return authContext.getLab();
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
   * return the current space or null if there is no space in the context
   */
  static getCurrentSpace(): CnSpace | null {
    const authContext = this.getAuthContext();

    if (authContext == null) return null;

    return authContext.getSpace();
  }

  /**
   * return the current space or throw an Unauthorized exception
   * if there is no space in the context
   */
  static getAndCheckCurrentSpace(): CnSpace {
    const space: CnSpace | null = this.getCurrentSpace();

    if (space == null) {
      throw new BlUnauthorizedException('No space in the context');
    }

    return space;
  }

  /**
   * return the role of the current user for the current space
   * or null if there is no space in the context
   */
  static getCurrentRoleInSpace(): CnSpaceUserRole | null {
    const authContext = this.getAuthContext();

    if (authContext == null) return null;

    return authContext.getRoleInSpace();
  }

  /**
   * return the role of the current user for the current space
   */
  static getAndCheckCurrentRoleInSpace(): CnSpaceUserRole {
    const role: CnSpaceUserRole | null = this.getCurrentRoleInSpace();

    if (role == null) {
      throw new BlUnauthorizedException('No role in the context');
    }

    return role;
  }

  static isAdmin(): boolean {
    return this.getAndCheckCurrentUser().isAdmin();
  }

  static getAndCheckUserSpaceInfo(): CnUserSpaceInfo {
    const authContext = this.getAuthContext();

    if (authContext == null) {
      throw new BlUnauthorizedException('No user space info in the context');
    }

    if (
      authContext.type === 'user' ||
      authContext.type === 'labProd' ||
      authContext.type === 'labDev' ||
      authContext.type === 'labManager' ||
      // A machine call that has already been authorized in the Space it named. Absent
      // from this list, every Space-scoped check would refuse the MCP — the failure mode
      // of an allowlist, and the reason adding a context type here is deliberate rather
      // than a formality.
      authContext.type === 'mcp'
    )
      return authContext.userInfo;

    throw new BlUnauthorizedException('No user space info in the context');
  }

  static getAdditionalInfo(): CnRequestAuthAdditionalData | null {
    return this.getCurrentAdditionalData();
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
   * Default user used when no request is in the context (cron jobs)
   * @param user
   */
  public static setRobotUser(user: CnUser | null): void {
    CnCurrentUserHelper.robotUser = user;
  }
}
