import {Observable} from 'rxjs';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/ca-environment';
import {CaCurrentOrganizationService} from '../service-api/ca-current-organization.service';

/**
 * Only for local environment, add the organization domain to the request
 */
@Injectable()
export class CaOrganizationInterceptor implements HttpInterceptor {

  private readonly organizationHeader = 'local-organization';

  constructor(private currentOrganizationService: CaCurrentOrganizationService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!environment.production && this.currentOrganizationService.getCurrentOrganizationDomainDev() != null) {
      req = req.clone({
        headers: req.headers.set(this.organizationHeader, this.currentOrganizationService.getCurrentOrganizationDomainDev())
      });
    }
    return next.handle(req);
  }


}
