import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthenticatedUserService} from '../service-api/authenticated-user.service';
import {RouterService} from '../service/router.service';

/**
 * Guard to secure route to only give access to admin
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authenticatedUserService: AuthenticatedUserService,
              private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authenticatedUserService.isAdmin()) {
      return true;
    } else {
      return this.router.parseUrl(RouterService.getAppRoute());
    }
  }

}
