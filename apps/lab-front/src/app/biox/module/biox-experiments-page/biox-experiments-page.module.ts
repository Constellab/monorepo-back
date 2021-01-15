import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxExperimentsPageComponent} from './component/biox-experiments-page/biox-experiments-page.component';
import {CoreModule} from '../../../core/core.module';
import {BioxExperimentCoreModule} from '../../../core/entity-module/biox-experiment-core/biox-experiment-core.module';

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
    BioxExperimentCoreModule,
  ]
})
export class BioxExperimentsPageModule {
}
