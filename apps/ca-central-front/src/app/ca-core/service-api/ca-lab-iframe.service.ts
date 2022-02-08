import {Injectable} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {CaLabIframeOptions} from '../service/ca-router.service';
import {FlLabRoute} from '@monorepo/front-core-lib';

/**
 * Service to manage iframe service
 */
@Injectable({
  providedIn: 'root'
})
export class CaLabIframeService {

  private readonly baseRoute: string = 'central-api';

  constructor(private sanitizer: DomSanitizer) {
  }

  /**
   * return the login route to open a lab
   * @param labUrl url of the lab
   * @param tempToken single use token for the login
   * @param iframeOption additional option to open the iframe
   */
  public getLoginSafeUrl(labUrl: string, tempToken: string, iframeOption ?: CaLabIframeOptions): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.getLoginUrl(labUrl, tempToken));
  }

  public getLoginUrl(labUrl: string, tempToken: string): string {
    return labUrl + '/' + FlLabRoute.autoLogin.getRoute(tempToken);
  }

}
