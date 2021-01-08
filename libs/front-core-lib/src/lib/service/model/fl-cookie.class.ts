import {InjectionToken} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';

/**
 * Accessible cookie containing the Authorization expiration date
 *
 * Used to know if the user is logged on
 */
export const flAuthExpiredCookie: string = 'Auth_Expiration';



/**
 * Object containing default options to pass when setting cookies.
 *
 * The object may have following properties:
 */
export interface FlCookieOptions {
  /**
   * The cookie will be available only for this path and its
   *   sub-paths. By default, this is the URL that appears in your `<base>` tag.
   */
  path?: string;

  /**
   * The cookie will be available only for this domain and
   * its sub-domains. For security reasons the user agent will not accept the cookie
   * if the current domain is not a sub-domain of this domain or equal to it.
   */
  domain?: string;

  /**
   * String of the form "Wdy, DD Mon YYYY HH:MM:SS GMT"
   * or a Date object indicating the exact date/time this cookie will expire.
   *
   * Default expire is session
   */
  expires?: number | Date;

  /**
   * If `true`, then the cookie will only be available through a
   * secured connection.
   */
  secure?: boolean;

  /**
   * SameSite OWASP samesite token `Lax` or `Strict`
   */
  sameSite?: 'Lax' | 'Strict';
}

/**
 * Parameters to ask the user to accept the cookies
 */
export interface FlAcceptanceCookiesConfig {
  /**
   * The component with the content to display
   * (must be included in the EntryComponents)
   */
  component: ComponentType<any>;

  /**
   * Display mode for the component either in a dialog or in a snack bar
   *
   * If snackbar is choose it must have a closed button because
   * it is displayed with no max duration
   */
  displayMode: 'dialog' | 'snackbar';

  /**
   * Version of the acceptance cookie. If a new version is provided, the
   * acceptance will be ask again
   */
  version: number;
}

/**
 * Content of the acceptance cookie
 */
export interface FlAcceptanceCookie {
  /**
   * Accepted version
   */
  version: number;

  /**
   * Date of acceptance as a time
   */
  date: number;
}

export const COOKIE_MODULE_CONFIG =
  new InjectionToken<FlAcceptanceCookiesConfig>('COOKIE_CONFIG');
