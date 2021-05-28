import {RouterModule, Routes} from '@angular/router';
import {LoginPageComponent} from './component/login-page/login-page.component';
import {NgModule} from '@angular/core';
import {LoginGuard} from './guard/login.guard';

const loginRoutes: Routes = [
  {path: 'login', component: LoginPageComponent, canActivate: [LoginGuard]}
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
