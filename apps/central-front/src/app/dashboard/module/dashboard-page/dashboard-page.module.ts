import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardPageComponent} from './component/dashboard-page/dashboard-page.component';
import {CoreModule} from '../../../core/core.module';
import {ProjectCoreModule} from '../../../core/entity-module/project-core/project-core.module';
import {RouterModule} from '@angular/router';
import {LabsCatalogComponent} from './component/labs-catalog/labs-catalog.component';
import {LabCoreModule} from '../../../core/entity-module/lab-core/lab-core.module';
import {DashboardModulePageComponent} from './component/dashboard-module-page/dashboard-module-page.component';
import {ProtocolCoreModule} from '../../../core/entity-module/protocol-core/protocol-core.module';
import {DashboardProjectsComponent} from './component/dashboard-projects/dashboard-projects.component';
import {DashboardLabInstancesComponent} from './component/dashboard-lab-instances/dashboard-lab-instances.component';
import {DashboardProtocolsComponent} from './component/dashboard-protocols/dashboard-protocols.component';

/**
 * Module for the dashboard page
 */
@NgModule({
  declarations: [
    DashboardPageComponent,
    LabsCatalogComponent,
    DashboardModulePageComponent,
    DashboardProjectsComponent,
    DashboardLabInstancesComponent,
    DashboardProtocolsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,
    ProjectCoreModule,
    LabCoreModule,
    ProtocolCoreModule,
  ]
})
export class DashboardPageModule {
}
