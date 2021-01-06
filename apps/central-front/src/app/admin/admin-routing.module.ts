import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {AdminDashboardPageComponent} from './component/admin-dashboard-page/admin-dashboard-page.component';

const routes: Route[] = [
  {path: '', component: AdminDashboardPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AdminRoutingModule {
}

