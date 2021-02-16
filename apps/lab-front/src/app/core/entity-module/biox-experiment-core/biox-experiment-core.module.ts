import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxExperimentTableComponent} from './component/biox-experiment-table/biox-experiment-table.component';
import {CoreModule} from '../../core.module';
import {RouterModule} from '@angular/router';
import {BioxExperimentCardComponent} from './component/biox-experiment-card/biox-experiment-card.component';
import {BioxExperimentFormDialogComponent} from './component/biox-experiment-form-dialog/biox-experiment-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    BioxExperimentTableComponent,
    BioxExperimentCardComponent,
    BioxExperimentFormDialogComponent,
  ],
  exports: [
    BioxExperimentTableComponent,
    BioxExperimentCardComponent,
    BioxExperimentFormDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
  ]
})
export class BioxExperimentCoreModule {
}
