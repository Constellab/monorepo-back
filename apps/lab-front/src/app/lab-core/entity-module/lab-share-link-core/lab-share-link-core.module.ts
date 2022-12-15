import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {LabCoreModule} from '../../lab-core.module';
import {
  LabShareLinkFormDialogComponent
} from './component/lab-share-link-form-dialog/lab-share-link-form-dialog.component';
import {LabShareLinkTableComponent} from './component/lab-share-link-table/lab-share-link-table.component';


@NgModule({
  declarations: [
    LabShareLinkFormDialogComponent,
    LabShareLinkTableComponent
  ],
  exports: [
    LabShareLinkFormDialogComponent,
    LabShareLinkTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    LabCoreModule
  ],
})
export class LabShareLinkCoreModule { }
