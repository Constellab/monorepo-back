import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {RouterService} from '../../core/service/router.service';
import {JwtManagerService} from '../../core/service/jwt-manager.service';

/**
 * Login page guard to redirect to app pages if a token exists
 */
@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private jwtManager: JwtManagerService, private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.jwtManager.hasToken()) {
      return this.router.createUrlTree([RouterService.getAppRoute()]);
    }
    return true;
  }

}
