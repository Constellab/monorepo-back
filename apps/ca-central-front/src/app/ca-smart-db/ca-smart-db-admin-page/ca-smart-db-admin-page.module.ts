import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSmartDbCoreModule} from '../ca-smart-db-core/ca-smart-db-core.module';
import {CaSmartDbAdminPageComponent} from './component/ca-smart-db-admin-page/ca-smart-db-admin-page.component';
import {CaSmartDbManagementComponent} from './component/ca-smart-db-management/ca-smart-db-management.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {
  CaSmartDbImportDialogComponent
} from './component/ca-smart-db-import-dialog/ca-smart-db-import-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [CaSmartDbAdminPageComponent, CaSmartDbManagementComponent, CaSmartDbImportDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,

    CaSmartDbCoreModule,
  ]
})
export class CaSmartDbAdminPageModule {
}
