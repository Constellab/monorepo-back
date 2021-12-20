import {RouterModule, Routes} from '@angular/router';
import {LabLoginPageComponent} from './component/lab-login-page/lab-login-page.component';
import {NgModule} from '@angular/core';
import {LabLoginGuard} from './guard/lab-login.guard';

const loginRoutes: Routes = [
  {path: 'login', component: LabLoginPageComponent, canActivate: [LabLoginGuard]}
];

@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class LabLoginRoutingModule {
}
