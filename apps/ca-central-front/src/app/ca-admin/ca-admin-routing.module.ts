import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CaAdminDashboardPageComponent} from './component/ca-admin-dashboard-page/ca-admin-dashboard-page.component';
import {CaAdminPageComponent} from './component/ca-admin-page/ca-admin-page.component';
import {CaAdminServersPageComponent} from './component/ca-admin-servers-page/ca-admin-servers-page.component';
import {CaAdminSpacesPageComponent} from './component/ca-admin-spaces-page/ca-admin-spaces-page.component';

const routes: Route[] = [
  {
    path: '', component: CaAdminPageComponent, children: [
      {path: '', component: CaAdminDashboardPageComponent},
      {path: 'spaces', component: CaAdminSpacesPageComponent},
      {path: 'servers', component: CaAdminServersPageComponent},
    ]
  },
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

