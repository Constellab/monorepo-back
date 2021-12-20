import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectDetailPageComponent} from './component/project-detail-page/project-detail-page.component';
import {CoreModule} from '../../../core/core.module';
import {ProjectCoreModule} from '../../../core/entity-module/project-core/project-core.module';
import {ProjectDetailComponent} from './component/project-detail/project-detail.component';
import {RouterModule} from '@angular/router';
import {ExperimentCoreModule} from '../experiment-core/experiment-core.module';
import {ExperimentsListComponent} from './component/experiments-list/experiments-list.component';

/**
 * Module for the project detail page
 */
@NgModule({
  declarations: [
    ProjectDetailPageComponent,
    ProjectDetailComponent,
    ExperimentsListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,
    ProjectCoreModule,
    ExperimentCoreModule,
  ]
})
export class ProjectDetailPageModule {
}
