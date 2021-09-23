import {BlRequestContext} from './bl-request-context';
import {Request} from 'express';
import {BlCookieHelper} from '@monorepo/back-core-lib';

/**
 * Request Context helper to access the current request
 */
export class BlRequestContextHelper {

  static getCurrentRequest(): Request {
    return this.getCurrentContext()?.req || null;
  }

  private static getCurrentContext(): BlRequestContext {
    const requestContext = BlRequestContext.currentContext;
    return requestContext || null;
  }

  protected static getHeaderFromContext(headerName: string): string {
    return this.getCurrentRequest().headers[headerName] as string;
  }

  private static getCookieFromContext(cookieName: string): string {
    return BlCookieHelper.getCookieFromHeader(this.getCurrentRequest().cookies, cookieName);
  }
}
