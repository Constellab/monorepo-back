import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {CaAuthenticatedUserService} from '../service-api/ca-authenticated-user.service';
import {CaRouterService} from '../service/ca-router.service';

/**
 * Guard to secure route to only give access to admin
 */
@Injectable({
  providedIn: 'root'
})
export class CaAdminGuard implements CanActivate {

  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authenticatedUserService.isAdmin()) {
      return true;
    } else {
      return this.router.parseUrl(CaRouterService.getAppRoute());
    }
  }

}
