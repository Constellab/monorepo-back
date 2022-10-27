import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {LabRouterService} from '../../lab-core/service/lab-router.service';
import {LabAuthenticationService} from '../../lab-core/service/lab-authentication.service';

/**
 * Login page guard to redirect to app pages if a token exists
 */
@Injectable({
  providedIn: 'root'
})
export class LabLoginGuard implements CanActivate {
  constructor(private authenticationService: LabAuthenticationService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(route.queryParams.autoRedirect === 'false') return true;
    if (this.authenticationService.hasAuthorizationCookie()) {
      return this.router.createUrlTree([LabRouterService.getAppRoute()]);
    }
    return true;
  }

}
