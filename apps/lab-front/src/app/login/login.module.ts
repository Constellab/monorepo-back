import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginPageComponent} from './component/login-page/login-page.component';
import {LoginRoutingModule} from './login-routing.module';
import {CoreModule} from '../core/core.module';

/**
 * Module containing page when the user in not logged
 */
@NgModule({
  declarations: [
    LoginPageComponent,

  ],
  imports: [
    CommonModule,

    CoreModule,

    // routing
    LoginRoutingModule,
  ]
})
export class LoginModule {
}
