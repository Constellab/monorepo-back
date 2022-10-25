import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlDialogService} from '../../../fl-dialog/fl-dialog.service';
import {Router} from '@angular/router';
import {FlLoginSavedRoute} from '../../../../utils/fl-login-saved-route';
import {CmCredentials} from '@monorepo/common-model';
import {FlAuthService} from '../../service/fl-auth.service';
import {FlSignupDialogComponent} from '../fl-signup-dialog/fl-signup-dialog.component';
import {FlPasswordForgottenComponent} from '../fl-password-forgotten/fl-password-forgotten.component';
import {FlLoginFormComponent} from '../fl-login-form/fl-login-form.component';

/**
 * Form to call a login request using FlAuthService
 */
@Component({
  selector: 'fl-login',
  templateUrl: './fl-login.component.html',
  styleUrls: ['./fl-login.component.scss']
})
export class FlLoginComponent implements OnInit {

  /**
   * Redirection route after the login is successful, do nothing if not provided
   */
  @Input() appRoute?: string;

  /**
   * If true the password reset link and signup link are hidden
   */
  @Input() diableFooter: boolean = false;

  @Output() loginSuccess: EventEmitter<any> = new EventEmitter<any>();

  formGp: FormGroup<CmCredentials>;
  isLoading = false;

  constructor(private loginService: FlAuthService,
              private dialogService: FlDialogService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  // Init the html form
  private initForm(): void {
    this.formGp = FlLoginFormComponent.buildFormGroup();
  }

  login(): void {
    if (this.formGp.valid) {
      this.isLoading = true;
      this.loginService.login(this.formGp.getRawValue()).subscribe(
        response => this.onLoginSuccess(response),
        () => this.error()
      );
    }else{
      this.formGp.markAllAsTouched();
    }
  }

  private onLoginSuccess(response: any): void {
    this.isLoading = false;

    if (this.appRoute) {
      // redirect to the app
      // if a route has been saved, redirect to this route
      if (FlLoginSavedRoute.hasRoute()) {
        this.router.navigate([FlLoginSavedRoute.getRoutePath()], {queryParams: FlLoginSavedRoute.getRouteQueryParams()});
        FlLoginSavedRoute.clearRoute();
      } else {
        this.router.navigate([this.appRoute]);
      }
    }

    this.loginSuccess.next(response);
  }

  private error(): void {
    this.isLoading = false;
    this.formGp.get('password').reset();
  }

  openSignupDialog(): void {
    this.dialogService.openSmallDialog(FlSignupDialogComponent, {disableClose: true});
  }

  openPasswordForgotten(): void {
    this.dialogService.openSmallDialog(FlPasswordForgottenComponent);
  }

}
