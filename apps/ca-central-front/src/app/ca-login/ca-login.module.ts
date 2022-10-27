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
import {CaNoOrganizationPageComponent} from './component/ca-no-organization-page/ca-no-organization-page.component';

/**
 * Module containing page when the user in not logged
 */
@NgModule({
  declarations: [
    CaLoginPageComponent,
    CaSignupToOrganizationPageComponent,
    CaNoOrganizationPageComponent,
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
