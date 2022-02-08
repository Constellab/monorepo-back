import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {labConstBaseRoute} from '../../lab-core/utils/lab-base-route';
import {FlLabRoute} from '@monorepo/front-core-lib';
import {LabAuthenticationService} from '../../lab-core/service/lab-authentication.service';
import {LabRouterService} from '../../lab-core/service/lab-router.service';
import {catchError, map} from 'rxjs/operators';

/**
 * Guard to get the token from the query param named 'token', store it locally
 *
 * Then it redirects the user to the app
 */
@Injectable({
  providedIn: 'root'
})
export class LabAutoLoginGuard implements CanActivate {

  constructor(private router: Router, private authenticateService: LabAuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const token: string = route.queryParams[FlLabRoute.autoLogin.tokenQueryParam];

    if (token) {
      // store the token in the
      return this.authenticateService.autoLogin(token).pipe(
        map(() => this.router.parseUrl('/' + labConstBaseRoute)),
        catchError(() => of(this.router.parseUrl(LabRouterService.getLoginRoute())))
      );
    } else {
      return this.router.parseUrl(LabRouterService.getLoginRoute());
    }
  }

}
