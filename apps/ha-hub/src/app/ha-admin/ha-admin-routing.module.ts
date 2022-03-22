import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import {HaAdminGuard} from '../ha-core/ha-guard/ha-admin.guard';
import {HaAdminPageComponent} from './module/ha-admin-page/ha-admin-page.component';

const routes: Route[] = [
  {
    path: '',
    component: HaAdminPageComponent,
    canActivate: [HaAdminGuard]
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
