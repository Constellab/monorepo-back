import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaProjectDetailPageRoutingModule} from './ca-project-object-detail-page-routing.module';
import {CaProjectDetailPageModule} from '../ca-project-detail-page/ca-project-detail-page.module';
import {CaExperimentDetailPageModule} from '../ca-experiment-detail-page/ca-experiment-detail-page.module';
import {CaReportDetailPageModule} from '../ca-report-detail-page/ca-report-detail-page.module';
import {
  CaProjectObjectDetailPageComponent
} from './component/ca-project-object-detail-page/ca-project-object-detail-page.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaProjectObjectCoreModule} from '../ca-project-object-core/ca-project-object-core.module';
import {RouterModule} from '@angular/router';
import {CaProjectObjectTreeComponent} from './component/ca-project-object-tree/ca-project-object-tree.component';
import {CaProjectBreadcrumbComponent} from './component/ca-project-breadcrumb/ca-project-breadcrumb.component';
import {CaProjectCoreModule} from '../../../ca-core/entity-module/ca-project-core/ca-project-core.module';

@NgModule({
  declarations: [
    CaProjectObjectDetailPageComponent,
    CaProjectObjectTreeComponent,
    CaProjectBreadcrumbComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
    CaProjectCoreModule,
    CaProjectDetailPageModule,
    CaExperimentDetailPageModule,
    CaReportDetailPageModule,
    CaProjectObjectCoreModule,

    CaProjectDetailPageRoutingModule,
  ]
})
export class CaProjectObjectDetailPageModule {
}
