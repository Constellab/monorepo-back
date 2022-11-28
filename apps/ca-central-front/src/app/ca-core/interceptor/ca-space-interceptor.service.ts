import {Observable} from 'rxjs';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/ca-environment';
import {CaCurrentSpaceService} from '../service-api/ca-current-space.service';

/**
 * Only for local environment, add the space domain to the request
 */
@Injectable()
export class CaSpaceInterceptor implements HttpInterceptor {

  private readonly spaceHeader = 'local-space';

  constructor(private currentSpaceService: CaCurrentSpaceService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!environment.production && this.currentSpaceService.getCurrentSpaceDomainDev() != null) {
      req = req.clone({
        headers: req.headers.set(this.spaceHeader, this.currentSpaceService.getCurrentSpaceDomainDev())
      });
    }
    return next.handle(req);
  }


}
