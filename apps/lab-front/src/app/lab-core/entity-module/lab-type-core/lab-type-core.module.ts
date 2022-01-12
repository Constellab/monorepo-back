import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabTypeAdvancedSearchFormComponent
} from './component/lab-type-advanced-search-form/lab-type-advanced-search-form.component';
import {LabTypeSearchComponent} from './component/lab-type-search/lab-type-search.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabCoreModule} from '../../lab-core.module';
import {LabBrickCoreModule} from '../lab-brick-core/lab-brick-core.module';
import {
  LabSelectProcessTypeDialogComponent
} from './component/lab-select-process-type-dialog/lab-select-process-type-dialog.component';
import {LabProcessCoreModule} from '../lab-process-core/lab-process-core.module';

@NgModule({
  declarations: [
    LabTypeAdvancedSearchFormComponent,
    LabTypeSearchComponent,
    LabSelectProcessTypeDialogComponent
  ],
  exports: [
    LabTypeAdvancedSearchFormComponent,
    LabTypeSearchComponent,
    LabSelectProcessTypeDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
    LabBrickCoreModule,
    LabProcessCoreModule,
  ],
})
export class LabTypeCoreModule {
}
