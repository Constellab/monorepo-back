import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxExperimentsListPageComponent} from './component/biox-experiments-page-list/biox-experiments-list-page.component';
import {CoreModule} from '../../../core/core.module';
import {BioxExperimentCoreModule} from '../../../core/entity-module/biox-experiment-core/biox-experiment-core.module';

/**
 * Module for the list of experiments BioX page
 */
@NgModule({
  declarations: [
    BioxExperimentsListPageComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
    BioxExperimentCoreModule,
  ]
})
export class BioxExperimentsPageModule {
}
