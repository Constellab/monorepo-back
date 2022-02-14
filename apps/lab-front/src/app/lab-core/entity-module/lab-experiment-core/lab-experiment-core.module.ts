import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabExperimentTableComponent} from './component/lab-experiment-table/lab-experiment-table.component';
import {LabCoreModule} from '../../lab-core.module';
import {RouterModule} from '@angular/router';
import {LabExperimentCardComponent} from './component/lab-experiment-card/lab-experiment-card.component';
import {
  LabExperimentFormDialogComponent
} from './component/lab-experiment-form-dialog/lab-experiment-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabProjectCoreModule} from '../lab-project-core/lab-project-core.module';
import {LabExperimentSearchComponent} from './component/lab-experiment-search/lab-experiment-search.component';
import {
  LabExperimentAdvancedSearchFormComponent
} from './component/lab-experiment-advanced-search-form/lab-experiment-advanced-search-form.component';
import {
  LabExperimentStatusOptionsComponent
} from './component/lab-experiment-status-options/lab-experiment-status-options.component';
import {
  LabExperimentTypeOptionsComponent
} from './component/lab-experiment-type-options/lab-experiment-type-options.component';
import {
  LabSelectExperimentDialogComponent
} from './component/lab-select-experiment-dialog/lab-select-experiment-dialog.component';
import {LabUserCoreModule} from '../lab-user-core/lab-user-core.module';


@NgModule({
  declarations: [
    LabExperimentTableComponent,
    LabExperimentCardComponent,
    LabExperimentFormDialogComponent,
    LabExperimentSearchComponent,
    LabExperimentAdvancedSearchFormComponent,
    LabExperimentStatusOptionsComponent,
    LabExperimentTypeOptionsComponent,
    LabSelectExperimentDialogComponent,
  ],
  exports: [
    LabExperimentTableComponent,
    LabExperimentCardComponent,
    LabExperimentFormDialogComponent,
    LabExperimentSearchComponent,
    LabExperimentAdvancedSearchFormComponent,
    LabExperimentStatusOptionsComponent,
    LabExperimentTypeOptionsComponent,
    LabSelectExperimentDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
    LabProjectCoreModule,
    LabUserCoreModule,
  ]
})
export class LabExperimentCoreModule {
}
