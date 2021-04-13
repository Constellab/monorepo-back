import {Injectable} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {LabIframeOptions} from '../service/router.service';
import {FlLabRoute} from '@monorepo/front-core-lib';

/**
 * Service to manage iframe service
 */
@Injectable({
  providedIn: 'root'
})
export class LabIframeService {

  private readonly baseRoute: string = 'central-api';

  constructor(private sanitizer: DomSanitizer) {
  }

  /**
   * return the login route to open a lab
   * @param labUrl url of the lab
   * @param loginToken single use token for the login
   * @param iframeOption additional option to open the iframe
   */
  public getLoginSafeUrl(labUrl: string, loginToken: string, iframeOption ?: LabIframeOptions): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(labUrl + FlLabRoute.autoLogin.getRoute(loginToken));
  }

}
