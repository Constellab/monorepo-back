import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaDocumentTableComponent} from './component/ca-document-table/ca-document-table.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {
  CaDocumentNameFormDialogComponent
} from './component/ca-document-name-form-dialog/ca-document-name-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CaDocumentActionsMenuComponent} from './component/ca-document-actions-menu/ca-document-actions-menu.component';


@NgModule({
  declarations: [
    CaDocumentTableComponent,
    CaDocumentNameFormDialogComponent,
    CaDocumentActionsMenuComponent
  ],
  exports: [
    CaDocumentTableComponent,
    CaDocumentNameFormDialogComponent,
    CaDocumentActionsMenuComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
  ],
})
export class CaDocumentCoreModule {
}
