import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaProjectDetailPageComponent} from './component/ca-project-detail-page/ca-project-detail-page.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaProjectCoreModule} from '../../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {CaProjectDetailComponent} from './component/ca-project-detail/ca-project-detail.component';
import {RouterModule} from '@angular/router';
import {CaExperimentCoreModule} from '../ca-experiment-core/ca-experiment-core.module';
import {CaReportCoreModule} from '../ca-report-core/ca-report-core.module';
import {CaGroupCoreModule} from '../../../ca-core/entity-module/ca-group-core/ca-group-core.module';
import {
  CaProjectSharedGroupsListComponent
} from './component/ca-project-shared-groups-list/ca-project-shared-groups-list.component';
import {CaProjectChildrenComponent} from './component/ca-project-children/ca-project-children.component';
import {CaProjectDetailPageRoutingModule} from './ca-project-detail-page-routing.module';
import {CaProjectObjectCoreModule} from '../ca-project-object-core/ca-project-object-core.module';

/**
 * Module for the project detail page
 */
@NgModule({
  declarations: [
    CaProjectDetailPageComponent,
    CaProjectDetailComponent,
    CaProjectSharedGroupsListComponent,
    CaProjectChildrenComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
    CaProjectObjectCoreModule,
    CaProjectCoreModule,
    CaExperimentCoreModule,
    CaReportCoreModule,
    CaGroupCoreModule,

    CaProjectDetailPageRoutingModule,
  ]
})
export class CaProjectDetailPageModule {
}
