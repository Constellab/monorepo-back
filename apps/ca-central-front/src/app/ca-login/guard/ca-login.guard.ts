/**
 * Login page guard to redirect to app pages if a token exists
 */
import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {CaAuthenticationService} from '../service/ca-authentication.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaLoginGuard implements CanActivate {
  constructor(private loginService: CaAuthenticationService, private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.loginService.hasAuthorizationCookie()) {
      return this.router.createUrlTree(['/app']);
    }
    return true;
  }

}
