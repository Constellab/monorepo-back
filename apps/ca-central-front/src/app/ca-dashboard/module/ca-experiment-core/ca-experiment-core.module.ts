import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaLabCoreModule} from '../../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {RouterModule} from '@angular/router';
import {CaExperimentInfoComponent} from './component/ca-experiment-info/ca-experiment-info.component';
import {CaExperimentsListComponent} from './component/ca-experiments-list/ca-experiments-list.component';


@NgModule({
  declarations: [
    CaExperimentInfoComponent,
    CaExperimentsListComponent,
  ],
  exports: [
    CaExperimentInfoComponent,
    CaExperimentsListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
    CaLabCoreModule,
  ]
})
export class CaExperimentCoreModule {
}
