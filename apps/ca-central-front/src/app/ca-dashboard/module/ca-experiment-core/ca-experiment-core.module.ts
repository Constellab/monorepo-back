import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaExperimentCardComponent} from './component/ca-experiment-card/ca-experiment-card.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {
  CaExperimentFormDialogComponent
} from './component/ca-experiment-form-dialog/ca-experiment-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaLabCoreModule} from '../../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {RouterModule} from '@angular/router';
import {CaExperimentInfoComponent} from './component/ca-experiment-info/ca-experiment-info.component';


@NgModule({
  declarations: [
    CaExperimentCardComponent,
    CaExperimentFormDialogComponent,
    CaExperimentInfoComponent
  ],
  exports: [
    CaExperimentCardComponent,
    CaExperimentFormDialogComponent,
    CaExperimentInfoComponent,
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
