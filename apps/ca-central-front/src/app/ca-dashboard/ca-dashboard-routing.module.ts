import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaDashboardPageComponent
} from './module/ca-dashboard-page/component/ca-dashboard-page/ca-dashboard-page.component';
import {
  CaProjectDetailPageComponent
} from './module/ca-project-detail-page/component/ca-project-detail-page/ca-project-detail-page.component';
import {
  CaExperimentDetailPageComponent
} from './module/ca-experiment-detail-page/component/ca-experiment-detail-page/ca-experiment-detail-page.component';
import {
  CaDashboardModulePageComponent
} from './module/ca-dashboard-page/component/ca-dashboard-module-page/ca-dashboard-module-page.component';

const routes: Route[] = [
  {
    path: '', component: CaDashboardModulePageComponent, children: [
      {path: '', component: CaDashboardPageComponent},
      {path: 'project/:id', component: CaProjectDetailPageComponent, children: []},
      {path: 'project/:id/experiment/:id', component: CaExperimentDetailPageComponent},
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
export class CaDashboardRoutingModule {

}
