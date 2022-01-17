import {RouterModule, Routes} from '@angular/router';
import {CaLoginPageComponent} from './component/ca-login-page/ca-login-page.component';
import {NgModule} from '@angular/core';
import {CaLoginGuard} from './guard/ca-login.guard';
import {FlResetPasswordPageComponent} from '@monorepo/front-core-lib';

const loginRoutes: Routes = [
  {path: 'login', component: CaLoginPageComponent, canActivate: [CaLoginGuard]},
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
