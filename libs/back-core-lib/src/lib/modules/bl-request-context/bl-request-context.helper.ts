import { BlRequestContext } from './bl-request-context';
import { Request } from 'express';
import { BlCookieHelper } from '../../utils/bl-cookie.helper';

/**
 * Request Context helper to access the current request
 */
export class BlRequestContextHelper {
  static getCurrentRequest(): Request {
    return this.getCurrentContext()?.req ?? null;
  }

  private static getCurrentContext(): BlRequestContext {
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

  private static getCookieFromContext(cookieName: string): string {
    return BlCookieHelper.getCookieFromHeader(this.getCurrentRequest().cookies, cookieName);
  }
}
