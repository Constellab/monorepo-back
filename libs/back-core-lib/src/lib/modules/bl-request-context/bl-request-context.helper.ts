import { CL_DEFAULT_LANG, CL_LANG_COOKIE, clLangIsSupported, ClSupportedLanguage } from '@monorepo/core-lib';
import { Request } from 'express';

import { BlCookieHelper } from '../../utils/bl-cookie.helper';
import { BlRequestContext } from './bl-request-context';

/**
 * Request Context helper to access the current request
 */
export class BlRequestContextHelper {
  static getCurrentRequest(): Request {
    // The public contract exposes `Request` since callers use it inside request scope
    // where the context always exists. The `?? null` fallback preserves the historical
    // runtime behavior (null outside request scope); the cast keeps the external contract
    // stable to avoid rippling null-handling into the consuming apps.
    return (this.getCurrentContext()?.req ?? null) as Request;
  }

  protected static getCurrentContext(): BlRequestContext | null {
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

  /**
   * Returns undefined when called outside a request scope (queue job, cron, or a
   * request whose context was never set). Callers such as the exception filter run
   * in both worlds, so this must never throw.
   */
  protected static getHeaderFromContext(headerName: string): string | undefined {
    return this.getCurrentContext()?.req?.headers[headerName] as string | undefined;
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

  private static getCookieFromContext(cookieName: string): string | undefined {
    const cookies = this.getCurrentContext()?.req?.cookies;
    if (cookies == null) return undefined;
    return BlCookieHelper.getCookieFromHeader(cookies, cookieName);
  }

  public static getLangHeader(): ClSupportedLanguage {
    const lang: string | undefined = this.getHeaderFromContext(CL_LANG_COOKIE);
    // check that the lang exists (it is undefined outside a request scope)
    if (lang == null || !clLangIsSupported(lang)) {
      return CL_DEFAULT_LANG;
    }
    return lang as ClSupportedLanguage;
  }
}
