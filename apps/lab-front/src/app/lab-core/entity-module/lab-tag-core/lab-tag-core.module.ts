import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core.module';
import {LabTagDashboardComponent} from './component/lab-tag-dashboard/lab-tag-dashboard.component';
import {LabTagEntityDetailComponent} from './component/lab-tag-entity-detail/lab-tag-entity-detail.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabTagFormDialogComponent} from './component/lab-tag-form-dialog/lab-tag-form-dialog.component';
import {LabTagHelpDialogComponent} from './component/lab-tag-help-dialog/lab-tag-help-dialog.component';


@NgModule({
  declarations: [
    LabTagDashboardComponent,
    LabTagEntityDetailComponent,
    LabTagFormDialogComponent,
    LabTagHelpDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
  ],
  exports: [
    LabTagDashboardComponent,
    LabTagEntityDetailComponent,
    LabTagHelpDialogComponent
  ]
})
export class LabTagCoreModule { }
