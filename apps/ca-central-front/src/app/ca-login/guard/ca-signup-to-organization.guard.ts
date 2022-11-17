import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {CaAuthService} from '../service/ca-auth.service';
import {Observable} from 'rxjs';
import {CaRouterService} from '../../ca-core/service/ca-router.service';

/**
 * Guard to redirect to join organization page if the user is already connected
 */
@Injectable({
  providedIn: 'root'
})
export class CaSignupToOrganizationGuard implements CanActivate {
  constructor(private loginService: CaAuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.loginService.hasAuthorizationCookie()) {
      return this.router.createUrlTree([CaRouterService.getJoinOrganizationRoute(route.params.code)]);
    }
    return true;
  }

}
