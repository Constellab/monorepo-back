import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginPageComponent} from './component/login-page/login-page.component';
import {LoginRoutingModule} from './login-routing.module';
import {CoreModule} from '../core/core.module';
import {LoginComponent} from './component/login/login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SignupDialogComponent} from './component/signup-dialog/signup-dialog.component';
import {PasswordForgottenComponent} from './component/password-forgotten/password-forgotten.component';
import {ResetPasswordPageComponent} from './component/reset-password-page/reset-password-page.component';

/**
 * Module containing page when the user in not logged
 */
@NgModule({
  declarations: [
    LoginPageComponent,
    LoginComponent,
    SignupDialogComponent,
    PasswordForgottenComponent,
    ResetPasswordPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,

    // routing
    LoginRoutingModule,
  ]
})
export class LoginModule {
}
