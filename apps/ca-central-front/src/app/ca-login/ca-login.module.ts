import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaLoginPageComponent} from './component/ca-login-page/ca-login-page.component';
import {CaLoginRoutingModule} from './ca-login-routing.module';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {
  CaSignupToOrganizationPageComponent
} from './component/ca-signup-to-organization-page/ca-signup-to-organization-page.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaOrganizationCoreModule} from '../ca-core/entity-module/ca-organization-core/ca-organization-core.module';

/**
 * Module containing page when the user in not logged
 */
@NgModule({
  declarations: [
    CaLoginPageComponent,
    CaSignupToOrganizationPageComponent,

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,
    CaOrganizationCoreModule,

    // routing
    CaLoginRoutingModule,
  ]
})
export class CaLoginModule {
}
