import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { DaAdminDocFormPageComponent } from './module/da-admin-doc-form/da-admin-doc-form-page/da-admin-doc-form-page.component';
import { DaAdminListPageComponent } from './module/da-admin-list-page/da-admin-list-page/da-admin-list-page.component';
import {DaAdminLoginComponent} from './module/da-admin-login/da-admin-login/da-admin-login.component';
import {DaLoginGuard} from '../da-core/da-guard/da-login.guard';

const routes: Route[] = [
  {
    path: '',
    component: DaAdminListPageComponent
  },
  {
    path: 'edit',
    component: DaAdminDocFormPageComponent
  },
  {
    path: 'edit/:id',
    component: DaAdminDocFormPageComponent
  },
  {
    path: 'login',
    component: DaAdminLoginComponent,
    canActivate: [DaLoginGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class DaAdminRoutingModule{}
