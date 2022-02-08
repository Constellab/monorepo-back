import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
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

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authenticationService.hasAuthorizationCookie()) {
      return this.router.createUrlTree([LabRouterService.getAppRoute()]);
    }
    return true;
  }

}
