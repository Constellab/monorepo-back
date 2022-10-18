import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CaLoginPageComponent} from '../ca-login/component/ca-login-page/ca-login-page.component';
import {CaLoginGuard} from '../ca-login/guard/ca-login.guard';
import {
  CaUserCompleteInfoPageComponent
} from './component/ca-user-complete-info-page/ca-user-complete-info-page.component';

const loginRoutes: Routes = [
  {path: 'login', component: CaLoginPageComponent, canActivate: [CaLoginGuard]},
  {path: ':id', component: CaUserCompleteInfoPageComponent},
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
