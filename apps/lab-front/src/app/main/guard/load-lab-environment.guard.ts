import {Injectable} from '@angular/core';
import {CanActivate, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {LabEnvironmentService} from '../../core/service/lab-environment.service';
import {map} from 'rxjs/operators';

/**
 * this guard init the Lab dev environment before accessing to the page
 * The loading is only delay if the development mode is activated
 */
@Injectable({
  providedIn: 'root'
})
export class LoadLabEnvironmentGuard implements CanActivate {

  constructor(private labEnvService: LabEnvironmentService) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // init the lab env and wait for it's return
    return this.labEnvService.init().pipe(
      map(() => true)
    );
  }

}
