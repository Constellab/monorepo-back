import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaAdminDashboardPageComponent} from './component/ca-admin-dashboard-page/ca-admin-dashboard-page.component';

const routes: Route[] = [
  {path: '', component: CaAdminDashboardPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CaAdminRoutingModule {
}

