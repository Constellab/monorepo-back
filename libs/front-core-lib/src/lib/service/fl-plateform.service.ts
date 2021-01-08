import {Platform} from '@angular/cdk/platform';
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';

/**
 * Service to get information about the current device such as
 * device, browser and rendering type
 */
@Injectable({
  providedIn: 'root'
})
export class FlPlatformService {

  constructor(private platform: Platform, @Inject(PLATFORM_ID) private platformId: any) {
  }

  /**
   * Return true if the current browser is a mobile device
   */
  public isMobile(): boolean {
    return this.platform.ANDROID || this.platform.IOS;
  }

  /**
   * Return true if the current browser is Android
   */
  public isAndroid(): boolean {
    return this.platform.ANDROID;
  }

  /**
   * Return true if the current browser is Apple IOS
   */
  public isIOS(): boolean {
    return this.platform.IOS;
  }

  /**
   * Return true if the current browser is Chrome
   */
  public isChrome(): boolean {
    return this.platform.isBrowser && !this.platform.EDGE && !this.platform.SAFARI && !this.platform.FIREFOX;
  }

  /**
   * Return true if the current browser is Safari
   */
  public isSafari(): boolean {
    return this.platform.SAFARI;
  }

  /**
   * Return true if the current browser is Microsoft Edge
   */
  public isEdge(): boolean {
    return this.platform.EDGE;
  }

  /**
   * Return true if the current browser is Firefox
   */
  public isFirefox(): boolean {
    return this.platform.FIREFOX;
  }

  /**
   * Return true if angular is being rendered in the browser (not in server with SSR)
   */
  public isBrowserPlatform(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Return true if angular is being rendered in the server with the server side rendering (SSR)
   */
  public isServerPlatform(): boolean {
    return isPlatformServer(this.platformId);
  }

  /**
   * Return true if the application is being rendered in an iframe
   */
  public isInFrame(): boolean {
    return this.isBrowserPlatform() && window.frameElement != null;
  }
}

