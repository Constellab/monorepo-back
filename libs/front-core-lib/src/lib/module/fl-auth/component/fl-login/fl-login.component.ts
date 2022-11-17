import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlDialogService} from '../../../fl-dialog/fl-dialog.service';
import {CmCredentials} from '@monorepo/common-model';
import {FlAuthLoginResponse, FlAuthService} from '../../service/fl-auth.service';
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
   * If true the password reset link and signup link are hidden
   */
  @Input() hideFooter: boolean = false;

  @Output() loginSuccess: EventEmitter<FlAuthLoginResponse> = new EventEmitter<FlAuthLoginResponse>();

  formGp: FormGroup<CmCredentials>;
  isLoading = false;

  constructor(private authService: FlAuthService,
              private dialogService: FlDialogService) {
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
      this.authService.login(this.formGp.getRawValue()).subscribe(
        response => this.onLoginSuccess(response),
        () => this.error()
      );
    } else {
      this.formGp.markAllAsTouched();
    }
  }

  private onLoginSuccess(response: FlAuthLoginResponse): void {
    this.isLoading = false;

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
