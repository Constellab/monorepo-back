import {Component, OnInit} from '@angular/core';
import {Validators} from '@angular/forms';
import {AuthenticationService} from '../../service/authentication.service';
import {SignupDialogComponent} from '../signup-dialog/signup-dialog.component';
import {PasswordForgottenComponent} from '../password-forgotten/password-forgotten.component';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Credentials} from '../../../core/model/global/credentials.class';
import {FlDialogService, FlLoginSavedRoute} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  formGp: FormGroup<Credentials>;
  isLoading = false;

  constructor(private loginService: AuthenticationService,
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
      this.router.navigate(['/app']);
    }
  }

  private error(): void {
    this.isLoading = false;
    this.formGp.get('password').reset();
  }

  openSignupDialog(): void {
    this.dialogService.openSmallDialog(SignupDialogComponent);
  }

  openPasswordForgotten(): void {
    this.dialogService.openSmallDialog(PasswordForgottenComponent);
  }


}
