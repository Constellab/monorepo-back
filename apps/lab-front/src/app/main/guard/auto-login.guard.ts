import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {constBaseRoute} from '../../core/utils/base-route';
import {FlLabRoute} from '@monorepo/front-core-lib';
import {LabEnvStore} from '../../core/service/lab-env.store';

/**
 * Guard to get the token from the query param named 'token', store it locally
 *
 * Then it redirects the user to the app
 */
@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanActivate {

  constructor(private router: Router, private jwtManager: LabEnvStore) {
  }

  canActivate(
    route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const token: string = route.queryParams[FlLabRoute.autoLogin.tokenQueryParam];

    if (token) {
      // store the token in the
      this.jwtManager.storeUserJWT(token);
    }

    return this.router.parseUrl('/' + constBaseRoute);
  }

}
