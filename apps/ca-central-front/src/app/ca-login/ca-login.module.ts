import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaLoginPageComponent} from './component/ca-login-page/ca-login-page.component';
import {CaLoginRoutingModule} from './ca-login-routing.module';
import {CaCoreModule} from '../ca-core/ca-core.module';

/**
 * Module containing page when the user in not logged
 */
@NgModule({
  declarations: [
    CaLoginPageComponent,

  ],
  imports: [
    CommonModule,

    CaCoreModule,

    // routing
    CaLoginRoutingModule,
  ]
})
export class CaLoginModule {
}
