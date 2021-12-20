import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxExperimentTableComponent} from './component/biox-experiment-table/biox-experiment-table.component';
import {CoreModule} from '../../core.module';
import {RouterModule} from '@angular/router';
import {BioxExperimentCardComponent} from './component/biox-experiment-card/biox-experiment-card.component';
import {
  BioxExperimentFormDialogComponent
} from './component/biox-experiment-form-dialog/biox-experiment-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BioxProjectCoreModule} from '../biox-project-core/biox-project-core.module';
import {BioxExperimentSearchComponent} from './component/biox-experiment-search/biox-experiment-search.component';
import {
  BioxExperimentAdvancedSearchFormComponent
} from './component/biox-experiment-advanced-search-form/biox-experiment-advanced-search-form.component';
import {
  BioxExperimentStatusOptionsComponent
} from './component/biox-experiment-status-options/biox-experiment-status-options.component';
import {
  BioxExperimentTypeOptionsComponent
} from './component/biox-experiment-type-options/biox-experiment-type-options.component';


@NgModule({
  declarations: [
    BioxExperimentTableComponent,
    BioxExperimentCardComponent,
    BioxExperimentFormDialogComponent,
    BioxExperimentSearchComponent,
    BioxExperimentAdvancedSearchFormComponent,
    BioxExperimentStatusOptionsComponent,
    BioxExperimentTypeOptionsComponent,
  ],
  exports: [
    BioxExperimentTableComponent,
    BioxExperimentCardComponent,
    BioxExperimentFormDialogComponent,
    BioxExperimentSearchComponent,
    BioxExperimentAdvancedSearchFormComponent,
    BioxExperimentStatusOptionsComponent,
    BioxExperimentTypeOptionsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
    BioxProjectCoreModule,
  ]
})
export class BioxExperimentCoreModule {
}
