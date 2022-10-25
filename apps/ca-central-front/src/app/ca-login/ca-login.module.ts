import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaLoginPageComponent} from './component/ca-login-page/ca-login-page.component';
import {CaLoginRoutingModule} from './ca-login-routing.module';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {
  CaJoinOrganizationPageComponent
} from './component/ca-join-organization-page/ca-join-organization-page.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

/**
 * Module containing page when the user in not logged
 */
@NgModule({
  declarations: [
    CaLoginPageComponent,
    CaJoinOrganizationPageComponent,

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,

    // routing
    CaLoginRoutingModule,
  ]
})
export class CaLoginModule {
}
