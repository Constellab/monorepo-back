import { BlRequestContextHelper } from '../bl-request-context/bl-request-context.helper';
import { clDefaultLang, clLangCookie, clLangIsSupported, ClSupportedLanguage } from '@monorepo/core-lib';
import { BlUser } from '../../models/bl-user/bl-user.class';
import { BlUnauthorizedException } from '../../exceptions/bl-unauthorized.exception';

/**
 * User context helper to get the current user or current request
 */
export class BlCurrentUserHelper extends BlRequestContextHelper {
  private static robotUser: BlUser | null = null;
  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): BlUser | null {
    const request: Express.Request = this.getCurrentRequest();
    // if there is no request and a manual user is set, return it
    // this is used for cron jobs
    if (request == null && this.robotUser != null) {
      return this.robotUser;
    }
    return (request && (request.user as BlUser)) || null;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): BlUser {
    const user: BlUser = this.getCurrentUser();

    if (user == null) {
      throw new BlUnauthorizedException('No user in the context');
    }

    return user;
  }

  /**
   * Get the current user lang
   * If a user is connected it returns it's language
   * If not it get the lang from the 'lang' header
   * Otherwise it return the default lang
   */
  static getCurrentLang(): ClSupportedLanguage {
    let lang = this.getCurrentUser()?.lang || this.getLangHeader() || clDefaultLang;

    // check that the lang exists
    if (!clLangIsSupported(lang)) {
      lang = clDefaultLang;
    }

    return lang as ClSupportedLanguage;
  }

  private static getLangHeader(): string {
    return this.getHeaderFromContext(clLangCookie);
  }

  /**
   * Default user used when no request is in the context (cron jobs)
   * @param user
   */
  public static setRobotUser(user: BlUser | null): void {
    BlCurrentUserHelper.robotUser = user;
  }
}
