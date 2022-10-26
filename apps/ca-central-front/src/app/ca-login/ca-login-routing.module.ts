import {RouterModule, Routes} from '@angular/router';
import {CaLoginPageComponent} from './component/ca-login-page/ca-login-page.component';
import {NgModule} from '@angular/core';
import {CaLoginGuard} from './guard/ca-login.guard';
import {FlResetPasswordPageComponent} from '@monorepo/front-core-lib';
import {
  CaSignupToOrganizationPageComponent
} from './component/ca-signup-to-organization-page/ca-signup-to-organization-page.component';
import {CaSignupToOrganizationGuard} from './guard/ca-signup-to-organization.guard';

const loginRoutes: Routes = [
  {path: 'login', component: CaLoginPageComponent, canActivate: [CaLoginGuard]},
  {
    path: 'signup-organization/:code',
    component: CaSignupToOrganizationPageComponent,
    canActivate: [CaSignupToOrganizationGuard]
  },
  {path: 'reset-password/:token', component: FlResetPasswordPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaLoginRoutingModule {
}
