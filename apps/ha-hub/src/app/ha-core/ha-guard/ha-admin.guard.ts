/**
 * Login page guard to redirect to app pages if a token exists
 */
import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {HaAuthService} from '../ha-service/ha-auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HaAdminGuard implements CanActivate {
  constructor(private loginService: HaAuthService, private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.loginService.hasAuthorizationCookie()) {
      return true;
    }
    return this.router.createUrlTree(['/admin/login']);
  }

}
