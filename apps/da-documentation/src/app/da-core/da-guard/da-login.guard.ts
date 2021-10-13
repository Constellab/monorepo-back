/**
 * Login page guard to redirect to app pages if a token exists
 */
import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {DaAuthService} from '../da-service/da-auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DaLoginGuard implements CanActivate {
  constructor(private loginService: DaAuthService, private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.loginService.hasAuthorizationCookie()) {
      return this.router.createUrlTree(['/admin']);
    }
    return true;
  }

}
