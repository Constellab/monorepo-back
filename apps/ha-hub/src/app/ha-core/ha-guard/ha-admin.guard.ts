/**
 * Login page guard to redirect to app pages if a token exists
 */
import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {HaAuthService} from '../ha-service/ha-auth.service';
import {Observable} from 'rxjs';
import {FlDialogService} from '@monorepo/front-core-lib';
import {HaMainLoginComponent} from '../../ha-main/ha-main-login/ha-main-login.component';

@Injectable({
  providedIn: 'root'
})
export class HaAdminGuard implements CanActivate {

  currentUrl: string;

  constructor(
    private loginService: HaAuthService,
    private dialogService: FlDialogService,
    private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.loginService.hasAuthorizationCookie()) {
      return true;
    }
    this.currentUrl = this.router.url;

    this.dialogService.openSmallDialog(HaMainLoginComponent).afterClosed().subscribe(() => {
      this.router.navigateByUrl(this.router.createUrlTree([this.currentUrl])).then();
    });

    return false;
  }

}
