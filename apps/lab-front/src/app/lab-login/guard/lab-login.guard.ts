import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {LabRouterService} from '../../lab-core/service/lab-router.service';
import {LabEnvStore} from '../../lab-core/service/lab-env.store';

/**
 * Login page guard to redirect to app pages if a token exists
 */
@Injectable({
  providedIn: 'root'
})
export class LabLoginGuard implements CanActivate {
  constructor(private jwtManager: LabEnvStore, private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.jwtManager.hasToken()) {
      return this.router.createUrlTree([LabRouterService.getAppRoute()]);
    }
    return true;
  }

}
