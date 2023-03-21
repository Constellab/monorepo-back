import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {HaAuthenticatedUserService} from '../ha-service/ha-authenticated-user.service';
import {HaStoryService} from '../ha-service/ha-story.service';
import {mergeMap, Observable} from 'rxjs';
import {HaAuthService} from '../ha-service/ha-auth.service';
import {HaRouterService} from '../ha-service/ha-router.service';

@Injectable({
  providedIn: 'root'
})
export class HaStoryGuard implements CanActivate {
  constructor(
    private storyService: HaStoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authUserService: HaAuthenticatedUserService,
    private loginService: HaAuthService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.loginService.hasAuthorizationCookie()) {
      return this.router.createUrlTree([HaRouterService.getLoginRoute()]);
    }
    const storyId = route.paramMap.get('id');
    return this.authUserService.isAdmin().pipe(
      mergeMap(isAdmin => {
        if (isAdmin) {
          return new Observable<boolean>(observer => observer.next(true));
        } else {
          return this.storyService.isStoryOwnerOrCoAuthor(storyId);
        }
      })
    );
  }
}
