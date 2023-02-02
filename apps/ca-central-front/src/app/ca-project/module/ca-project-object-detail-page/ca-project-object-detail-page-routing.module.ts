import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  CaProjectDetailPageComponent
} from '../ca-project-detail-page/component/ca-project-detail-page/ca-project-detail-page.component';
import {
  CaExperimentDetailPageComponent
} from '../ca-experiment-detail-page/component/ca-experiment-detail-page/ca-experiment-detail-page.component';
import {
  CaReportDetailPageComponent
} from '../ca-report-detail-page/component/ca-report-detail-page/ca-report-detail-page.component';
import {
  CaProjectObjectDetailPageComponent
} from './component/ca-project-object-detail-page/ca-project-object-detail-page.component';
import {
  CaDocumentDetailPageComponent
} from '../ca-document-detail-page/component/ca-document-detail-page/ca-document-detail-page.component';

const routes: Route[] = [
  {
    path: '', component: CaProjectObjectDetailPageComponent, children: [
      {path: ':projectId', component: CaProjectDetailPageComponent},
      {path: 'experiment/:experimentId', component: CaExperimentDetailPageComponent},
      {path: 'report/:reportId', component: CaReportDetailPageComponent},
      {path: 'document/:documentId', component: CaDocumentDetailPageComponent}
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
export class CaProjectDetailPageRoutingModule {
}

