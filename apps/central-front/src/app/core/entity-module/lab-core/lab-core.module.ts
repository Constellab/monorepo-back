import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../core.module';
import {LabCardComponent} from './component/lab-card/lab-card.component';
import {LabInstanceCardComponent} from './component/lab-instance-card/lab-instance-card.component';
import {
  SelectAccessibleLabInstanceOptionsComponent
} from './component/select-accessible-lab-instance-options/select-accessible-lab-instance-options.component';
import {LabInstanceStartStopComponent} from './component/lab-instance-start-stop/lab-instance-start-stop.component';
import {RouterModule} from '@angular/router';
import {LabInstancesListComponent} from './component/lab-instances-list/lab-instances-list.component';
import {LabInstanceTableComponent} from './component/lab-instance-table/lab-instance-table.component';
import {LabInstanceFormDialogComponent} from './component/lab-instance-form-dialog/lab-instance-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ServerInfoCoreModule} from '../server-info-core/server-info-core.module';
import {SelectLabOptionsComponent} from './component/select-lab-options/select-lab-options.component';
import {LabTableComponent} from './component/lab-table/lab-table.component';
import {LabFormDialogComponent} from './component/lab-form-dialog/lab-form-dialog.component';
import {
  LabInstanceStatusDialogComponent
} from './component/lab-instance-status-dialog/lab-instance-status-dialog.component';

/**
 * Core module for Lab and LabInstance
 */
@NgModule({
  declarations: [
    LabCardComponent,
    LabInstanceCardComponent,
    SelectAccessibleLabInstanceOptionsComponent,
    LabInstanceStartStopComponent,
    LabInstancesListComponent,
    LabInstanceTableComponent,
    LabInstanceFormDialogComponent,
    SelectLabOptionsComponent,
    LabTableComponent,
    LabFormDialogComponent,
    LabInstanceStatusDialogComponent,
  ],
  exports: [
    LabCardComponent,
    LabInstanceCardComponent,
    SelectAccessibleLabInstanceOptionsComponent,
    LabInstanceStartStopComponent,
    LabInstancesListComponent,
    LabInstanceTableComponent,
    LabInstanceFormDialogComponent,
    SelectLabOptionsComponent,
    LabTableComponent,
    LabFormDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    ServerInfoCoreModule,

    CoreModule,
  ]
})
export class LabCoreModule {
}
