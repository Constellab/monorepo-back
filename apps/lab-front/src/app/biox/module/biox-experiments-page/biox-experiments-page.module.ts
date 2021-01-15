import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxExperimentsPageComponent} from './component/biox-experiments-page/biox-experiments-page.component';
import {CoreModule} from '../../../core/core.module';
import {LabExperimentCoreModule} from '../../../core/entity-module/lab-experiment-core/lab-experiment-core.module';

/**
 * Module for the list of experiments BioX page
 */
@NgModule({
  declarations: [
    BioxExperimentsPageComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
    LabExperimentCoreModule,
  ]
})
export class BioxExperimentsPageModule {
}
