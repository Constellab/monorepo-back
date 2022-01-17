import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { HaAdminDocFormPageComponent } from './module/ha-admin-doc-form/ha-admin-doc-form-page/ha-admin-doc-form-page.component';
import { HaAdminListPageComponent } from './module/ha-admin-list-page/ha-admin-list-page/ha-admin-list-page.component';
import {HaAdminLoginComponent} from './module/ha-admin-login/ha-admin-login/ha-admin-login.component';
import {HaLoginGuard} from '../ha-core/ha-guard/ha-login.guard';
import {HaAdminGuard} from '../ha-core/ha-guard/ha-admin.guard';

const routes: Route[] = [
  {
    path: '',
    component: HaAdminListPageComponent,
    canActivate: [HaAdminGuard]
  },
  {
    path: 'edit',
    component: HaAdminDocFormPageComponent,
    canActivate: [HaAdminGuard]
  },
  {
    path: 'edit/:id',
    component: HaAdminDocFormPageComponent,
    canActivate: [HaAdminGuard]
  },
  {
    path: 'login',
    component: HaAdminLoginComponent,
    canActivate: [HaLoginGuard]
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
export class HaAdminRoutingModule {}
