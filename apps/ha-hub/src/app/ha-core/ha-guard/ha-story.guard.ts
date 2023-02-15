import {Injectable} from '@angular/core';
import {ActivatedRoute, CanActivate, Router, UrlTree} from '@angular/router';
import {HaAuthenticatedUserService} from '../ha-service/ha-authenticated-user.service';
import {HaStoryService} from '../ha-service/ha-story.service';
import {Observable} from 'rxjs';
import {CaRouterService} from '../../../../../ca-central-front/src/app/ca-core/service/ca-router.service';
import {HaAuthService} from '../ha-service/ha-auth.service';

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

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.loginService.hasAuthorizationCookie()) {
      return this.router.createUrlTree([CaRouterService.getLoginRoute()]);
    }
    const storyId = this.activatedRoute.snapshot.params.id;
    return this.authUserService.isAdmin() || this.storyService.isStoryOwnerOrCoAuthor(storyId);
  }
}
