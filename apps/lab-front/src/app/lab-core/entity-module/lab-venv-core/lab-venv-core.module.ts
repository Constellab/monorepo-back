import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabVenvTableComponent} from './lab-venv-table/lab-venv-table.component';
import {LabVenvDetailDialogComponent} from './lab-venv-detail-dialog/lab-venv-detail-dialog.component';
import {LabCoreModule} from '../../lab-core.module';
import {LabVenvCompleteInfoComponent} from './lab-venv-complete-info/lab-venv-complete-info.component';


@NgModule({
  declarations: [
    LabVenvTableComponent,
    LabVenvDetailDialogComponent,
    LabVenvCompleteInfoComponent
  ],
  exports: [
    LabVenvTableComponent,
    LabVenvDetailDialogComponent,
    LabVenvCompleteInfoComponent
  ],
  imports: [
    CommonModule,

    LabCoreModule,
  ],
})
export class LabVenvCoreModule { }
