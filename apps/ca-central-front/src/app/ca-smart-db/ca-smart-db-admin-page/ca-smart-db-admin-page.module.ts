import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSmartDbDocCoreModule} from '../ca-smart-db-doc-core/ca-smart-db-doc-core.module';
import {CaSmartDbAdminPageComponent} from './component/ca-smart-db-admin-page/ca-smart-db-admin-page.component';
import {CaSmartDbManagementComponent} from './component/ca-smart-db-management/ca-smart-db-management.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {
  CaSmartDbImportDialogComponent
} from './component/ca-smart-db-import-dialog/ca-smart-db-import-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaSmartDbVerificationComponent} from './component/ca-smart-db-verification/ca-smart-db-verification.component';
import {
  CaSmartDbVerifySentenceComponent
} from './component/ca-smart-db-verify-sentence/ca-smart-db-verify-sentence.component';

@NgModule({
  declarations: [
    CaSmartDbAdminPageComponent,
    CaSmartDbManagementComponent,
    CaSmartDbImportDialogComponent,
    CaSmartDbVerificationComponent,
    CaSmartDbVerifySentenceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,

    CaSmartDbDocCoreModule,
  ]
})
export class CaSmartDbAdminPageModule {
}
