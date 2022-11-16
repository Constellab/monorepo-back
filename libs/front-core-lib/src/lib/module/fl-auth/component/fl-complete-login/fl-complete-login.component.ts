import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {Router} from '@angular/router';
import {FlQueryParamHandler} from 'libs/front-core-lib/src/lib/model/fl-query-param-handler.class';
import {FlAuthLogin2FaResponse, FlAuthLoginResponse, FlAuthService} from '../../service/fl-auth.service';
import {FlLoginSavedRoute} from '../../../../utils/fl-login-saved-route';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface FlCompleteLoginQueryParam {
  twoFAUrlCode: string;
}

@Component({
  selector: 'fl-complete-login',
  templateUrl: './fl-complete-login.component.html',
  styleUrls: ['./fl-complete-login.component.scss'],
  providers: [FlQueryParamHandler]
})
export class FlCompleteLoginComponent implements OnInit {

  /**
   * Redirection route after the login is successful, do nothing if not provided
   */
  @Input() appRoute?: string;

  /**
   * If true the password reset link and signup link are hidden
   */
  @Input() disableLoginFooter: boolean = false;

  @Output() loginSuccess: EventEmitter<void> = new EventEmitter<void>();

  currentView$: Observable<'login' | '2fa'>;


  constructor(private router: Router,
              private queryParamHandler: FlQueryParamHandler<FlCompleteLoginQueryParam>,
              private authService: FlAuthService) {
  }

  ngOnInit(): void {
    this.currentView$ = this.queryParamHandler.getQueryParams().pipe(
      map(queryParams => queryParams.twoFAUrlCode == null ? 'login' : '2fa')
    );
  }

  onLoginSuccess(result: FlAuthLoginResponse): void {
    if (result.status === 'LOGGED_IN') {
      this.loginCompleted(result.expiresIn);
    } else {
      this.switchTo2FAView(result);
    }


  }

  private switchTo2FAView(result: FlAuthLoginResponse): void {
    this.queryParamHandler.mergeQueryParams({twoFAUrlCode: result.twoFAUrlCode});
  }

  onLogin2FASuccess(result: FlAuthLogin2FaResponse): void {
    this.loginCompleted(result.expiresIn);
  }

  private loginCompleted(expiresIn: number): void {
    this.authService.afterLogin(expiresIn);

    if (this.appRoute) {
      // redirect to the app
      // if a route has been saved, redirect to this route
      if (FlLoginSavedRoute.hasRoute()) {
        console.log(FlLoginSavedRoute.getRoutePath());
        this.router.navigate([FlLoginSavedRoute.getRoutePath()], {queryParams: FlLoginSavedRoute.getRouteQueryParams()});
        FlLoginSavedRoute.clearRoute();
      } else {
        this.router.navigate([this.appRoute]);
      }
    }
  }

}
