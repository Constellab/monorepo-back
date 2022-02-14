import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core.module';
import {LabReportSearchComponent} from './component/lab-report-search/lab-report-search.component';
import {
  LabReportAdvancedSearchFormComponent
} from './component/lab-report-advanced-search-form/lab-report-advanced-search-form.component';
import {LabReportTableComponent} from './component/lab-report-table/lab-report-table.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabReportFormDialogComponent} from './component/lab-report-form-dialog/lab-report-form-dialog.component';
import {LabSelectReportDialogComponent} from './component/lab-select-report-dialog/lab-select-report-dialog.component';
import {LabUserCoreModule} from '../lab-user-core/lab-user-core.module';

@NgModule({
  declarations: [
    LabReportSearchComponent,
    LabReportAdvancedSearchFormComponent,
    LabReportTableComponent,
    LabReportFormDialogComponent,
    LabSelectReportDialogComponent
  ],
  exports: [
    LabReportSearchComponent,
    LabReportAdvancedSearchFormComponent,
    LabReportTableComponent,
    LabReportFormDialogComponent,
    LabSelectReportDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,

    LabCoreModule,
    LabUserCoreModule,
  ],
})
export class LabReportCoreModule {
}
