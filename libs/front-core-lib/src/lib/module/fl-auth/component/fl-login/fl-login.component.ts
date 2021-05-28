import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {FlDialogService} from '../../../fl-dialog/fl-dialog.service';
import {Router} from '@angular/router';
import {Validators} from '@angular/forms';
import {FlLoginSavedRoute} from '../../../../utils/fl-login-saved-route';
import {CmCredentials} from '@monorepo/common-model';
import {FlAuthService} from '../../service/fl-auth.service';
import {FlSignupDialogComponent} from '../fl-signup-dialog/fl-signup-dialog.component';
import {FlPasswordForgottenComponent} from '../fl-password-forgotten/fl-password-forgotten.component';

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
   * Redirection route after the login is successful
   */
  @Input() appRoute: string;

  /**
   * If true the password reset link and signup link are hidden
   */
  @Input() diableFooter: boolean = false;

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
    this.formGp = new FormBuilder().group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }

  login(): void {
    if (this.formGp.valid) {
      this.isLoading = true;
      this.loginService.login(this.formGp.getRawValue()).subscribe(
        () => this.onLoginSuccess(),
        () => this.error()
      );
    }
  }

  private onLoginSuccess(): void {
    this.isLoading = false;
    // redirect to the app
    // if a route has been saved, redirect to this route
    if (FlLoginSavedRoute.hasRoute()) {
      this.router.navigate([FlLoginSavedRoute.getRoutePath()], {queryParams: FlLoginSavedRoute.getRouteQueryParams()});
      FlLoginSavedRoute.clearRoute();
    } else {
      this.router.navigate([this.appRoute]);
    }
  }

  private error(): void {
    this.isLoading = false;
    this.formGp.get('password').reset();
  }

  openSignupDialog(): void {
    this.dialogService.openSmallDialog(FlSignupDialogComponent);
  }

  openPasswordForgotten(): void {
    this.dialogService.openSmallDialog(FlPasswordForgottenComponent);
  }

}
