import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {CaAuthenticatedUserService} from '../../ca-core/service-api/ca-authenticated-user.service';
import {catchError, map} from 'rxjs/operators';
import {FlServerError} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../ca-core/service/ca-router.service';

/**
 * Guard TO ONLY BE PLACED for the /app route
 *
 * It load and save the connected user
 */
@Injectable({
  providedIn: 'root'
})
export class CaLoadUserGuard implements CanActivate {

  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authenticatedUserService.loadCurrentInfo().pipe(
      map(() => true),
      catchError((error: FlServerError) => {

        // if the user is not in any organization, redirect to the no-organization page
        if (error.nestedError?.code === 'error.user_without_organization') {
          return of(this.router.parseUrl(CaRouterService.getNoOrganizationRoute()));
        }

        return of(false);
      }) // if there was an error in the request, return false
    );
  }

}
