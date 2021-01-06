import {RouterModule, Routes} from '@angular/router';
import {LoginPageComponent} from './component/login-page/login-page.component';
import {NgModule} from '@angular/core';
import {LoginGuard} from './guard/login.guard';
import {ResetPasswordPageComponent} from './component/reset-password-page/reset-password-page.component';

const loginRoutes: Routes = [
  {path: 'login', component: LoginPageComponent, canActivate: [LoginGuard]},
  {path: 'reset-password/:token', component: ResetPasswordPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class LoginRoutingModule {
}
