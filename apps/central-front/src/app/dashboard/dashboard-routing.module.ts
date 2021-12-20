import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {DashboardPageComponent} from './module/dashboard-page/component/dashboard-page/dashboard-page.component';
import {
  ProjectDetailPageComponent
} from './module/project-detail-page/component/project-detail-page/project-detail-page.component';
import {
  ExperimentDetailPageComponent
} from './module/experiment-detail-page/component/experiment-detail-page/experiment-detail-page.component';
import {
  DashboardModulePageComponent
} from './module/dashboard-page/component/dashboard-module-page/dashboard-module-page.component';

const routes: Route[] = [
  {
    path: '', component: DashboardModulePageComponent, children: [
      {path: '', component: DashboardPageComponent},
      {path: 'project/:id', component: ProjectDetailPageComponent, children: []},
      {path: 'project/:id/experiment/:id', component: ExperimentDetailPageComponent},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DashboardRoutingModule {

}
