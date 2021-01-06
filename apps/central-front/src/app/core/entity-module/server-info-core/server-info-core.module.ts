import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ServerInfoCardComponent} from './component/server-info-card/server-info-card.component';
import {CoreModule} from '../../core.module';
import {ServerInfoTableComponent} from './component/server-info-table/server-info-table.component';
import {ServerInfoFormDialogComponent} from './component/server-info-form-dialog/server-info-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectServerInfoHostOptionsComponent} from './component/select-server-info-host-options/select-server-info-host-options.component';
import {SelectDiskTypeOptionsComponent} from './component/select-disk-type-options/select-disk-type-options.component';
import {SelectServerInfoOptionsComponent} from './component/select-server-info-options/select-server-info-options.component';


@NgModule({
  declarations: [
    ServerInfoCardComponent,
    ServerInfoTableComponent,
    ServerInfoFormDialogComponent,
    SelectServerInfoHostOptionsComponent,
    SelectDiskTypeOptionsComponent,
    SelectServerInfoOptionsComponent
  ],
  exports: [
    ServerInfoCardComponent,
    ServerInfoTableComponent,
    ServerInfoFormDialogComponent,
    SelectServerInfoHostOptionsComponent,
    SelectDiskTypeOptionsComponent,
    SelectServerInfoOptionsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CoreModule,
  ]
})
export class ServerInfoCoreModule {
}
