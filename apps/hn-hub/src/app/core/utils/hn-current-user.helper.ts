import { BlRequestContextHelper, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { HnUser } from '../../users/hn-user.entity';
import { Request } from 'express';

/**
 * Main auth when the user make a request
 */
export interface HnAuthContextUser {
  type: 'user';
  user: HnUser;
}

/**
 * Auth when a user triggers a request from the lab
 */
export interface HnAuthContextLab {
  type: 'lab';
  user: HnUser;
  labId: string;
}

/**
 * Auth for automatic request from the lab
 */
export interface HnAuthContextLabNoUser {
  type: 'labNoUser';
  labId: string;
}

/**
 * Auth for cron jobs
 */
export interface HnAuthContextCron {
  type: 'cron';
  user: HnUser;
}

/**
 * Type representing all type of auth context
 */
export type HnAuthContext = HnAuthContextUser | HnAuthContextLab | HnAuthContextLabNoUser | HnAuthContextCron;

export type HnRequest = Request & {
  user?: HnUser;
};

export class HnCurrentUserHelper extends BlRequestContextHelper {
  public static setAuthContext(content: HnAuthContext): void {
    super.setAuthContent(content);
  }

  protected static getAuthContext(): HnAuthContext {
    return super.getAuthContent() as HnAuthContext;
  }

  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): HnUser | null {
    const authContext = this.getAuthContext();

    if (authContext && authContext.type !== 'labNoUser') {
      return authContext.user;
    }
    return null;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): HnUser {
    const user = this.getCurrentUser();

    if (user == null) {
      throw new BlUnauthorizedException('No user in the context');
    }

    return user;
  }

  static getAndCheckLabInstanceCurrentLabId(): string {
    const authContext = this.getAuthContext();

    if (authContext != null && (authContext.type === 'lab' || authContext.type === 'labNoUser')) {
      return authContext.labId;
    }
    return null;
  }

  static isAdmin(): boolean {
    return this.getAndCheckCurrentUser().isAdmin();
  }
}
