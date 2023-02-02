import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaDocumentTableComponent} from './component/ca-document-table/ca-document-table.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';


@NgModule({
  declarations: [
    CaDocumentTableComponent
  ],
  exports: [
    CaDocumentTableComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
  ],
})
export class CaDocumentCoreModule { }
