import {RequestContext} from './request-context.model';
import {User} from '../../../users/user.entity';
import {UnauthorizedException} from '@nestjs/common';
import {CookieHelper} from '../../utils/cookie.helper';
import {Request} from 'express';
import {LabInstance} from '../../../lab-instances/lab-instance.entity';
import {clDefaultLang, clLangCookie, clLangIsSupported, ClSupportedLanguage} from '@monorepo/core-lib';

/**
 * Request Context helper to access the current user or request
 */
export class RequestContextHelper {

  /**
   * returns the current authenticated user or null if not authenticated
   */
  static getCurrentUser(): User | null {
    const request = this.getCurrentRequest();
    return (request && request.user as User) || null;
  }

  /**
   * returns the current authenticated user or throw a Unauthorized exception
   * if the user is not authenticated
   */
  static getAndCheckCurrentUser(): User {
    const user: User = this.getCurrentUser();

    if (user == null) {
      throw new UnauthorizedException();
    }

    return user;
  }

  /**
   * returns the current authenticated labInstance for routes annotated with @LabAuth
   * or null if not authenticated
   */
  static getLabInstance(): LabInstance | null {
    const request = this.getCurrentRequest();
    return (request && request.authInfo as LabInstance) || null;
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
   * Get the current user lang
   * If a user is connected it returns it's language
   * If not it get the lang from the 'lang' header
   * Otherwise it return the default lang
   */
  static getCurrentLang(): ClSupportedLanguage {
    let lang = this.getCurrentUser()?.lang ||
      this.getLangHeader() || clDefaultLang;

    // check that the lang exists
    if (!clLangIsSupported(lang)) {
      lang = clDefaultLang;
    }

    return lang as ClSupportedLanguage;
  }

  private static getLangHeader(): string {
    return this.getHeaderFromContext(clLangCookie);
  }

  static getCurrentRequest(): Request {
    return this.getCurrentContext()?.req || null;
  }

  private static getCurrentContext(): RequestContext {
    const requestContext = RequestContext.currentContext;
    return requestContext || null;
  }

  private static getHeaderFromContext(headerName: string): string {
    return this.getCurrentRequest().headers[headerName] as string;
  }

  private static getCookieFromContext(cookieName: string): string {
    return CookieHelper.getCookieFromHeader(this.getCurrentRequest().cookies, cookieName);
  }
}
