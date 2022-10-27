import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {CaCurrentOrganizationService} from '../../ca-core/service-api/ca-current-organization.service';

/**
 * Guard manage and load the current organization
 */
@Injectable({
  providedIn: 'root'
})
export class CaCurrentOrganizationGuard implements CanActivate {

  constructor(private currentOrganizationService: CaCurrentOrganizationService,
              private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true
    // return this.currentOrganizationService.init().pipe(
    //   catchError((error: FlServerError) => {
    //     // if the user is not in any organization, redirect to the no-organization page
    //     if(error.nestedError?.code === 'error.user_without_organization'){
    //       return of(this.router.parseUrl(CaRouterService.getNoOrganizationRoute()));
    //     }
    //     return of(false);
    //   }) // if there was an error in the request, return false
    // );
  }

}
