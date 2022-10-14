import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaDashboardPageComponent
} from './module/ca-dashboard-page/component/ca-dashboard-page/ca-dashboard-page.component';
import {
  CaProjectDetailPageComponent
} from '../ca-project/module/ca-project-detail-page/component/ca-project-detail-page/ca-project-detail-page.component';
import {
  CaExperimentDetailPageComponent
} from '../ca-project/module/ca-experiment-detail-page/component/ca-experiment-detail-page/ca-experiment-detail-page.component';
import {
  CaDashboardModulePageComponent
} from './module/ca-dashboard-page/component/ca-dashboard-module-page/ca-dashboard-module-page.component';
import {
  CaReportDetailPageComponent
} from '../ca-project/module/ca-report-detail-page/component/ca-report-detail-page/ca-report-detail-page.component';

const routes: Route[] = [
  {
    path: '', component: CaDashboardModulePageComponent, children: [
      {path: '', component: CaDashboardPageComponent},
      // route for projects
      {path: 'project/:projectId', component: CaProjectDetailPageComponent, children: []},
      {path: 'project/:projectId/report/:reportId', component: CaReportDetailPageComponent},
      {path: 'project/:projectId/experiment/:experimentId', component: CaExperimentDetailPageComponent},
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
