import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaServerInfoDetailComponent} from './component/ca-server-info-detail/ca-server-info-detail.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaServerInfoTableComponent} from './component/ca-server-info-table/ca-server-info-table.component';
import {
  CaServerInfoFormDialogComponent
} from './component/ca-server-info-form-dialog/ca-server-info-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  CaSelectDiskTypeOptionsComponent
} from './component/ca-select-disk-type-options/ca-select-disk-type-options.component';
import {
  CaSelectServerInfoOptionsComponent
} from './component/ca-select-server-info-options/ca-select-server-info-options.component';
import {CaServerInfoInlineComponent} from './component/ca-server-info-inline/ca-server-info-inline.component';
import {CaCloudProviderCoreModule} from '../ca-cloud-provider-core/ca-cloud-provider-core.module';


@NgModule({
  declarations: [
    CaServerInfoDetailComponent,
    CaServerInfoTableComponent,
    CaServerInfoFormDialogComponent,
    CaSelectDiskTypeOptionsComponent,
    CaSelectServerInfoOptionsComponent,
    CaServerInfoInlineComponent,
  ],
  exports: [
    CaServerInfoDetailComponent,
    CaServerInfoTableComponent,
    CaServerInfoFormDialogComponent,
    CaSelectDiskTypeOptionsComponent,
    CaSelectServerInfoOptionsComponent,
    CaServerInfoInlineComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,
    CaCloudProviderCoreModule,
  ]
})
export class CaServerInfoCoreModule {
}
