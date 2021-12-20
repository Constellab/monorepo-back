import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaProjectDetailPageComponent} from './component/ca-project-detail-page/ca-project-detail-page.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaProjectCoreModule} from '../../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {CaProjectDetailComponent} from './component/ca-project-detail/ca-project-detail.component';
import {RouterModule} from '@angular/router';
import {CaExperimentCoreModule} from '../ca-experiment-core/ca-experiment-core.module';
import {CaExperimentsListComponent} from './component/ca-experiments-list/ca-experiments-list.component';

/**
 * Module for the project detail page
 */
@NgModule({
  declarations: [
    CaProjectDetailPageComponent,
    CaProjectDetailComponent,
    CaExperimentsListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
    CaProjectCoreModule,
    CaExperimentCoreModule,
  ]
})
export class CaProjectDetailPageModule {
}
