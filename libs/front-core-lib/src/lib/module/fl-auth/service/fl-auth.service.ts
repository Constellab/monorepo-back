import {Observable} from 'rxjs';
import {CmCredentials} from '@monorepo/common-model';

/**
 * Service to enable login and logout method
 */
export abstract class FlAuthService {

  /**
   * Log in to API
   * The JWT is returned in a HTTPOnly cookie and is not accessible from JS
   * @param credentials username and password
   */
  public abstract login(credentials: CmCredentials): Observable<any>;


  /**
   * Call the API to disconnect the user and remove his
   * JWT from the cookies
   */
  public abstract logout(): Observable<any>;
}
