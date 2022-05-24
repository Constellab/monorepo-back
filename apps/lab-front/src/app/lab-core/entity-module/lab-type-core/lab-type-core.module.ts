import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabTypeAdvancedSearchFormComponent
} from './component/lab-type-advanced-search-form/lab-type-advanced-search-form.component';
import {LabTypeSearchComponent} from './component/lab-type-search/lab-type-search.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabCoreModule} from '../../lab-core.module';
import {LabBrickCoreModule} from '../lab-brick-core/lab-brick-core.module';
import {LabSelectTypeDialogComponent} from './component/lab-select-type-dialog/lab-select-type-dialog.component';
import {LabTypeDetailComponent} from './component/lab-type-detail/lab-type-detail.component';
import {
  LabTypeShowDetailButtonComponent
} from './component/lab-type-show-detail-button/lab-type-show-detail-button.component';
import {LabTypeDialogComponent} from './component/lab-type-dialog/lab-type-dialog.component';
import {LabProcessPortComponent} from './component/lab-process-port/lab-process-port.component';
import {LabProcessTypeTableComponent} from './component/lab-process-type-table/lab-process-type-table.component';
import {LabProcessPortColorPipe} from './pipe/lab-process-port-color.pipe';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    LabTypeAdvancedSearchFormComponent,
    LabTypeSearchComponent,
    LabSelectTypeDialogComponent,
    LabTypeDetailComponent,
    LabTypeDialogComponent,
    LabTypeShowDetailButtonComponent,
    LabProcessPortComponent,
    LabProcessTypeTableComponent,

    LabProcessPortColorPipe,
  ],
  exports: [
    LabTypeAdvancedSearchFormComponent,
    LabTypeSearchComponent,
    LabSelectTypeDialogComponent,
    LabTypeDetailComponent,
    LabTypeDialogComponent,
    LabTypeShowDetailButtonComponent,
    LabProcessPortComponent,
    LabProcessTypeTableComponent,

    LabProcessPortColorPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    LabCoreModule,
    LabBrickCoreModule,
  ],
})
export class LabTypeCoreModule {
}
