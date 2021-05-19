import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FlCleanableService, FlCleanerService} from '@monorepo/front-core-lib';

/**
 * Interceptor to add authorization header in request
 */
@Injectable({providedIn: 'root'})
export class AuthenticationInterceptor implements HttpInterceptor, FlCleanableService {

  private token: string;

  constructor() {
    FlCleanerService.getInstance().registerService(this);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if (this.token) {
      // append the Authorization header
      const headers: HttpHeaders = request.headers.append('Authorization', this.token);

      request = request.clone({
        // set the credential to false because the token is in the header
        // otherwise we have a CORS error
        // withCredentials: false,
        headers: headers
      });
    }
    return next.handle(request);
  }

  public setToken(token: string): void {
    this.token = token;
  }

  clean(): void {
    this.token = null;
  }


}
