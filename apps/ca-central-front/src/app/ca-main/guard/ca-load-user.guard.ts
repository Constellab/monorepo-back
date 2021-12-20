import {Injectable} from '@angular/core';
import {CanActivate, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {CaAuthenticatedUserService} from '../../ca-core/service-api/ca-authenticated-user.service';
import {catchError, map} from 'rxjs/operators';

/**
 * Guard TO ONLY BE PLACED for the /app route
 *
 * It load and save the connected user
 */
@Injectable({
  providedIn: 'root'
})
export class CaLoadUserGuard implements CanActivate {

  constructor(private authenticatedUserService: CaAuthenticatedUserService) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authenticatedUserService.loadAuthenticatedUser().pipe(
      map(user => user != null),
      catchError(() => of(false)) // if there was an error in the request, return false
    );
  }

}
