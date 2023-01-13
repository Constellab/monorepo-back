import {RouterModule, Routes} from '@angular/router';
import {CaLoginPageComponent} from './component/ca-login-page/ca-login-page.component';
import {NgModule} from '@angular/core';
import {CaLoginGuard} from './guard/ca-login.guard';
import {FlResetPasswordPageComponent} from '@monorepo/front-core-lib';
import {CaSignupToSpacePageComponent} from './component/ca-signup-to-space-page/ca-signup-to-space-page.component';
import {CaNoSpacePageComponent} from './component/ca-no-space-page/ca-no-space-page.component';

const loginRoutes: Routes = [
  {path: 'login', component: CaLoginPageComponent, canActivate: [CaLoginGuard]},
  {path: 'signup-space/:code', component: CaSignupToSpacePageComponent},
  {path: 'reset-password/:token', component: FlResetPasswordPageComponent},
  {path: 'no-space', component: CaNoSpacePageComponent},
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
