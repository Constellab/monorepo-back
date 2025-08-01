import { clDefaultLang, clLangCookie, clLangIsSupported, ClSupportedLanguage } from '@monorepo/core-lib';
import { Request } from 'express';

import { BlCookieHelper } from '../../utils/bl-cookie.helper';
import { BlRequestContext } from './bl-request-context';

/**
 * Request Context helper to access the current request
 */
export class BlRequestContextHelper {
  static getCurrentRequest(): Request {
    return this.getCurrentContext()?.req ?? null;
  }

  protected static getCurrentContext(): BlRequestContext {
    const requestContext = BlRequestContext.currentContext;
    return requestContext || null;
  }

  protected static getCurrentAdditionalData(): any {
    return this.getCurrentContext()?.additionalData ?? null;
  }

  protected static setAdditionalData(key: string, value: any): void {
    const requestContext = this.getCurrentContext();
    if (requestContext == null) return;
    requestContext.additionalData = Object.assign(requestContext.additionalData, { [key]: value });
  }

  protected static getHeaderFromContext(headerName: string): string {
    return this.getCurrentRequest().headers[headerName] as string;
  }

  protected static setAuthContent(content: any): void {
    const requestContext = this.getCurrentContext();
    if (requestContext == null) return;
    // this should not happen, but it is a security measure to check if the auth content is correctly set
    // otherwise there would be no error but security issue
    if (requestContext.authContext != null) {
      throw new Error('Auth content already set');
    }
    requestContext.authContext = content;
  }

  protected static getAuthContent(): any {
    return this.getCurrentContext()?.authContext ?? null;
  }

  private static getCookieFromContext(cookieName: string): string {
    return BlCookieHelper.getCookieFromHeader(this.getCurrentRequest().cookies, cookieName);
  }

  public static getLangHeader(): ClSupportedLanguage {
    const lang: string = this.getHeaderFromContext(clLangCookie);
    // check that the lang exists
    if (!clLangIsSupported(lang)) {
      return clDefaultLang;
    }
    return lang as ClSupportedLanguage;
  }
}
