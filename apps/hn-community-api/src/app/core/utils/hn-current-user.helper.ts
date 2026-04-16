import { BlRequestContextHelper, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Request } from 'express';

import { HnUser } from '../../users/hn-user.entity';

/**
 * Main auth when the user make a request
 */
export interface HnAuthContextUser {
  type: 'user';
  user: HnUser;
}

/**
 * Auth for requests from the lab. The user is optional because some
 * requests are triggered automatically by the lab without a user.
 */
export interface HnAuthContextLab {
  type: 'lab';
  user?: HnUser;
  labId: string;
  labApiKey: string;
}

/**
 * Auth for cron jobs
 */
export interface HnAuthContextCron {
  type: 'cron';
  user: HnUser;
}

/**
 * Auth for requests from the Space API (trusted source)
 */
export interface HnAuthContextSpace {
  type: 'space';
  user?: HnUser;
}

/**
 * Type representing all type of auth context
 */
export type HnAuthContext = HnAuthContextUser | HnAuthContextLab | HnAuthContextCron | HnAuthContextSpace;

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

    if (authContext) {
      return authContext.user ?? null;
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

    if (authContext != null && authContext.type === 'lab') {
      return authContext.labId;
    }
    return null;
  }

  static isAdmin(): boolean {
    return this.getAndCheckCurrentUser().isAdmin();
  }
}
