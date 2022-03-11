import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaOrganizationTableComponent} from './component/ca-organization-table/ca-organization-table.component';
import {CaCoreModule} from '../../ca-core.module';
import {
  CaOrganizationFormDialogComponent
} from './component/ca-organization-form-dialog/ca-organization-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    CaOrganizationTableComponent,
    CaOrganizationFormDialogComponent
  ],
  exports: [
    CaOrganizationTableComponent,
    CaOrganizationFormDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
  ],
})
export class CaOrganizationCoreModule {
}
