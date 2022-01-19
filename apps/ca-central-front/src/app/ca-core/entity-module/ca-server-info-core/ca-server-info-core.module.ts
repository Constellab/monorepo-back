import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaServerInfoCardComponent} from './component/ca-server-info-card/ca-server-info-card.component';
import {CaCoreModule} from '../../ca-core.module';
import {CaServerInfoTableComponent} from './component/ca-server-info-table/ca-server-info-table.component';
import {
  CaServerInfoFormDialogComponent
} from './component/ca-server-info-form-dialog/ca-server-info-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  CaSelectServerInfoHostOptionsComponent
} from './component/ca-select-server-info-host-options/ca-select-server-info-host-options.component';
import {
  CaSelectDiskTypeOptionsComponent
} from './component/ca-select-disk-type-options/ca-select-disk-type-options.component';
import {
  CaSelectServerInfoOptionsComponent
} from './component/ca-select-server-info-options/ca-select-server-info-options.component';


@NgModule({
  declarations: [
    CaServerInfoCardComponent,
    CaServerInfoTableComponent,
    CaServerInfoFormDialogComponent,
    CaSelectServerInfoHostOptionsComponent,
    CaSelectDiskTypeOptionsComponent,
    CaSelectServerInfoOptionsComponent,
  ],
  exports: [
    CaServerInfoCardComponent,
    CaServerInfoTableComponent,
    CaServerInfoFormDialogComponent,
    CaSelectServerInfoHostOptionsComponent,
    CaSelectDiskTypeOptionsComponent,
    CaSelectServerInfoOptionsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,
  ]
})
export class CaServerInfoCoreModule {
}
