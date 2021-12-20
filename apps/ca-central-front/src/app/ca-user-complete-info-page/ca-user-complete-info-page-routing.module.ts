import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DaLoginPageComponent} from '../ca-login/component/ca-login-page/da-login-page.component';
import {CaLoginGuard} from '../ca-login/guard/ca-login.guard';

const loginRoutes: Routes = [
  {path: 'login', component: DaLoginPageComponent, canActivate: [CaLoginGuard]},
  // {path: 'reset-password/:token', component: ResetPasswordPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaUserCompleteInfoPageRoutingModule {
}
