import {RouterModule, Routes} from '@angular/router';
import {CaLoginPageComponent} from './component/ca-login-page/ca-login-page.component';
import {NgModule} from '@angular/core';
import {CaLoginGuard} from './guard/ca-login.guard';
import {FlResetPasswordPageComponent} from '@monorepo/front-core-lib';
import {
  CaJoinOrganizationPageComponent
} from './component/ca-join-organization-page/ca-join-organization-page.component';

const loginRoutes: Routes = [
  {path: 'login', component: CaLoginPageComponent, canActivate: [CaLoginGuard]},
  {path: 'join-organization/:invitId', component: CaJoinOrganizationPageComponent},
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
