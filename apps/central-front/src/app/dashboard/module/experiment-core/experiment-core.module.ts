import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentCardComponent} from './component/experiment-card/experiment-card.component';
import {CoreModule} from '../../../core/core.module';
import {ExperimentFormDialogComponent} from './component/experiment-form-dialog/experiment-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabCoreModule} from '../../../core/entity-module/lab-core/lab-core.module';
import {RouterModule} from '@angular/router';
import {ExperimentInfoComponent} from './component/experiment-info/experiment-info.component';


@NgModule({
  declarations: [
    ExperimentCardComponent,
    ExperimentFormDialogComponent,
    ExperimentInfoComponent
  ],
  exports: [
    ExperimentCardComponent,
    ExperimentFormDialogComponent,
    ExperimentInfoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CoreModule,
    LabCoreModule,
  ]
})
export class ExperimentCoreModule {
}
