import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {LabAuthenticationService} from '../../lab-core/service/lab-authentication.service';
import {LabRouterService} from '../../lab-core/service/lab-router.service';

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

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    let expiresIn: number;
    try {
      expiresIn = parseInt(route.queryParams['expiresIn']);
    } catch (e) {
      expiresIn = null;
    }

    if (expiresIn) {
      // store the token in the
      this.authenticateService.setAuthExpirationCookie(expiresIn);
      return this.router.parseUrl(LabRouterService.getLoginRoute());
    } else {
      return this.router.parseUrl(LabRouterService.getLoginRoute());
    }
  }

}
