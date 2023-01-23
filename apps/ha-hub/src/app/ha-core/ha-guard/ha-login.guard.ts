/**
 * Login page guard to redirect to app pages if a token exists
 */
import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {HaAuthService} from '../ha-service/ha-auth.service';
import {Observable} from 'rxjs';
import {CaRouterService} from '../../../../../ca-central-front/src/app/ca-core/service/ca-router.service';

@Injectable({
  providedIn: 'root'
})
export class HaLoginGuard implements CanActivate {
  constructor(private loginService: HaAuthService, private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.loginService.hasAuthorizationCookie()) {
      return this.router.createUrlTree([CaRouterService.getLoginRoute()]);
    }
    return true;
  }

}
