import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaLoginPageComponent} from './component/ca-login-page/ca-login-page.component';
import {CaLoginRoutingModule} from './ca-login-routing.module';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {
  CaSignupToSpacePageComponent
} from './component/ca-signup-to-space-page/ca-signup-to-space-page.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaSpaceCoreModule} from '../ca-core/entity-module/ca-space-core/ca-space-core.module';
import {CaNoSpacePageComponent} from './component/ca-no-space-page/ca-no-space-page.component';
import { CaSignupPageComponent } from './component/ca-signup-page/ca-signup-page.component';

/**
 * Module containing page when the user in not logged
 */
@NgModule({
  declarations: [
    CaLoginPageComponent,
    CaSignupToSpacePageComponent,
    CaNoSpacePageComponent,
    CaSignupPageComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,
    CaSpaceCoreModule,

    // routing
    CaLoginRoutingModule,
  ]
})
export class CaLoginModule {
}
