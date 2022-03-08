import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaDashboardPageComponent} from './component/ca-dashboard-page/ca-dashboard-page.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaProjectCoreModule} from '../../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {RouterModule} from '@angular/router';
import {CaLabCoreModule} from '../../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {CaDashboardModulePageComponent} from './component/ca-dashboard-module-page/ca-dashboard-module-page.component';
import {CaDashboardProjectsComponent} from './component/ca-dashboard-projects/ca-dashboard-projects.component';
import {
  CaDashboardLabInstancesComponent
} from './component/ca-dashboard-lab-instances/ca-dashboard-lab-instances.component';
import {CaDashboardSmartDbsComponent} from './component/ca-dashboard-smart-dbs/ca-dashboard-smart-dbs.component';
import {CaSmartDbCoreModule} from '../../../ca-core/entity-module/ca-smart-db-core/ca-smart-db-core.module';

/**
 * Module for the dashboard page
 */
@NgModule({
  declarations: [
    CaDashboardPageComponent,
    CaDashboardModulePageComponent,
    CaDashboardProjectsComponent,
    CaDashboardLabInstancesComponent,
    CaDashboardSmartDbsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
    CaProjectCoreModule,
    CaLabCoreModule,
    CaSmartDbCoreModule
  ]
})
export class CaDashboardPageModule {
}
