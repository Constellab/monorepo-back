import {Injectable} from '@angular/core';
import {CanActivate, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {CaCurrentOrganizationService} from '../../ca-core/service-api/ca-current-organization.service';

/**
 * Guard manage and load the current organization
 */
@Injectable({
  providedIn: 'root'
})
export class CaCurrentOrganizationGuard implements CanActivate {

  constructor(private currentOrganizationService: CaCurrentOrganizationService) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.currentOrganizationService.init();
  }

}
