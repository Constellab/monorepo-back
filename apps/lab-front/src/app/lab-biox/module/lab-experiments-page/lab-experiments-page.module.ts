import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabExperimentsListPageComponent
} from './component/lab-experiments-page-list/lab-experiments-list-page.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {LabExperimentCoreModule} from '../../../lab-core/entity-module/lab-experiment-core/lab-experiment-core.module';

/**
 * Module for the list of experiments
 */
@NgModule({
  declarations: [
    LabExperimentsListPageComponent
  ],
  imports: [
    CommonModule,

    LabCoreModule,
    LabExperimentCoreModule,
  ]
})
export class LabExperimentsPageModule {
}
