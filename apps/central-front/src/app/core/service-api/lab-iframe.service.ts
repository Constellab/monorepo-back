import {Injectable} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {LabIframeOptions} from '../service/router.service';

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
    // set the iframe option in the query params
    const queryParams: string = iframeOption != null ? `?object_type=${iframeOption.objectType}&object_uri=${iframeOption.objectId}` : '';

    return this.sanitizer.bypassSecurityTrustResourceUrl(`${labUrl}${this.baseRoute}/login/${loginToken}${queryParams}`);
  }

}
