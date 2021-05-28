/**
 * Login page guard to redirect to app pages if a token exists
 */
import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {AuthenticationService} from '../service/authentication.service';
import {Observable} from 'rxjs';
import {RouterService} from '../../core/service/router.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private loginService: AuthenticationService, private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.loginService.hasToken()) {
      return this.router.createUrlTree([RouterService.getAppRoute()]);
    }
    return true;
  }

}
