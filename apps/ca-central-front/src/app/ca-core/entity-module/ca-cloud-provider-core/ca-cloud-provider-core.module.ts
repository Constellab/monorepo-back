import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCloudProviderTableComponent} from './component/ca-cloud-provider-table/ca-cloud-provider-table.component';
import {CaCoreModule} from '../../ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  CaCloudProviderFormDialogComponent
} from './component/ca-cloud-provider-form-dialog/ca-cloud-provider-form-dialog.component';
import {
  CaSelectCloudProviderOptionsComponent
} from './component/ca-select-cloud-provider-options/ca-select-cloud-provider-options.component';


@NgModule({
  declarations: [
    CaCloudProviderTableComponent,
    CaCloudProviderFormDialogComponent,
    CaSelectCloudProviderOptionsComponent,
  ],
  exports: [
    CaCloudProviderTableComponent,
    CaCloudProviderFormDialogComponent,
    CaSelectCloudProviderOptionsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
  ],
})
export class CaCloudProviderCoreModule { }
