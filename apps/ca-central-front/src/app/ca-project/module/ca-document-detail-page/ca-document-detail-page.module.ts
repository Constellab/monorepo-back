import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaDocumentDetailPageComponent} from './component/ca-document-detail-page/ca-document-detail-page.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaProjectObjectCoreModule} from '../ca-project-object-core/ca-project-object-core.module';
import {FormsModule} from '@angular/forms';
import {CaDocumentCoreModule} from '../ca-document-core/ca-document-core.module';


@NgModule({
  declarations: [
    CaDocumentDetailPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    CaCoreModule,
    CaProjectObjectCoreModule,
    CaDocumentCoreModule,
  ]
})
export class CaDocumentDetailPageModule { }
