import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CorePlatformService} from './core-plateform.service';
import {DateHelper} from '../utils/date-helper';
import {AcceptanceCookie, AcceptanceCookiesConfig, CookieOptions} from '../model/global/cookie.class';

/**
 * Service to manage browser cookies.
 *
 * Get, set and delete cookies.
 */
@Injectable({providedIn: 'root'})
export class CoreCookieService {

  private readonly ACCEPTANCE_COOKIE_KEY = 'ACCEPT_COOKIE';

  constructor(private cookieService: CookieService,
              private platformService: CorePlatformService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }


  /**
   * Check the cookies acceptances
   * @param config config to check the user cookies acceptance
   */
  public checkCookiesAcceptance(config: AcceptanceCookiesConfig): void {
    if (config == null || !this.canAccessCookies()) {
      return;
    }

    const acceptanceCookie: AcceptanceCookie = this.getParsedCookie(this.ACCEPTANCE_COOKIE_KEY);

    // check if the cookie exist and if the version has been accepted
    if (acceptanceCookie != null && acceptanceCookie.version >= config.version) {
      return;
    }

    // if we need to ask the permissions
    if (config.displayMode === 'dialog') {
      this.dialog.open(config.component).afterClosed().subscribe(
        () => this.setCookieAcceptance(config.version)
      );
    } else {
      this.snackBar.openFromComponent(config.component, {duration: -1}).afterDismissed().subscribe(
        () => this.setCookieAcceptance(config.version)
      );
    }
  }

  /**
   * Set the cookie acceptance in the cookies
   * @param version of the acceptance
   */
  public setCookieAcceptance(version: number): void {
    const acceptanceCookie: AcceptanceCookie = {
      version: version,
      date: new Date().getTime()
    };

    this.setCookie(this.ACCEPTANCE_COOKIE_KEY, acceptanceCookie, {
      expires: this.getDateInTenYears(),
      sameSite: 'Strict'
    });
  }

  /**
   * Get cookie parsed value
   * @param key key of the cookie
   * @param defaultValue the value returned if the cookie key does not exist
   * @return the parsed value of the cookie
   */
  public getParsedCookie(key: string, defaultValue: any = null): any {
    return JSON.parse(this.getStringCookie(key, defaultValue));
  }

  /**
   * Get the cookie value as a string
   * @param key key of the cookie
   * @param defaultValue the value returned if the cookie key does not exist
   * @return the string of the cookie
   */
  public getStringCookie(key: string, defaultValue: any = null): string {
    if (!this.canAccessCookies()) {
      return null;
    }

    return this.cookieService.get(key) || defaultValue;
  }

  /**
   * Stringify and set the cookie value
   * @param key key of the new or updated cookies
   * @param value value of the cookie (will be stringify if needed)
   * @param options options to store the cookie
   */
  public setCookie(key: string, value: any, options: CookieOptions = {sameSite: 'Strict', path: '/'}): void {
    if (!this.canAccessCookies()) {
      return;
    }

    let cookieValue: any = value;

    // stringify none string
    if (typeof cookieValue !== 'string') {
      cookieValue = JSON.stringify(cookieValue);
    }

    // set the cookie
    this.cookieService.set(key, cookieValue, options.expires, options.path, options.domain, options.secure, options.sameSite);
  }

  /**
   * Delete a cookie
   * @param key key of the cookie to delete
   * @param options options to store the cookie
   */
  public removeCookie(key: string, options: CookieOptions = {sameSite: 'Strict', path: '/'}): void {
    if (!this.canAccessCookies()) {
      return;
    }
    this.cookieService.delete(key, options.path, options.domain, options.secure, options.sameSite);
  }


  /**
   * Delete all the cookies
   */
  private removeAllCookies(): void {
    if (!this.canAccessCookies()) {
      return;
    }
    this.cookieService.deleteAll();
  }

  /**
   * Return true if the cookies are accessible
   */
  public canAccessCookies(): boolean {
    return this.platformService.isBrowserPlatform();
  }

  /**
   * returns true if the cookie exists
   * @param name name of the cookie to check
   */
  public check(name: string): boolean {
    return this.cookieService.check(name);
  }

  private getDateInTenYears(): Date {
    return new Date(new Date().getTime() + DateHelper.ONE_YEAR * 10);
  }
}
