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
import {CaCloudProviderInlineComponent} from './component/ca-cloud-provider-inline/ca-cloud-provider-inline.component';
import {
  CaCloudProviderRegionFormDialogComponent
} from './component/ca-cloud-provider-region-form-dialog/ca-cloud-provider-region-form-dialog.component';
import {
  CaCloudProviderRegionTableComponent
} from './component/ca-cloud-provider-region-table/ca-cloud-provider-region-table.component';
import {
  CaSelectCloudProviderRegionOptionsComponent
} from './component/ca-select-cloud-provider-region-options/ca-select-cloud-provider-region-options.component';
import {
  CaCloudProviderRegionInlineComponent
} from './component/ca-cloud-provider-region-inline/ca-cloud-provider-region-inline.component';
import {CaConfigCoreModule} from '../ca-config-core/ca-config-core.module';


@NgModule({
  declarations: [
    CaCloudProviderTableComponent,
    CaCloudProviderFormDialogComponent,
    CaSelectCloudProviderOptionsComponent,
    CaCloudProviderInlineComponent,
    CaCloudProviderRegionFormDialogComponent,
    CaCloudProviderRegionTableComponent,
    CaSelectCloudProviderRegionOptionsComponent,
    CaCloudProviderRegionInlineComponent,
  ],
  exports: [
    CaCloudProviderTableComponent,
    CaCloudProviderFormDialogComponent,
    CaSelectCloudProviderOptionsComponent,
    CaCloudProviderInlineComponent,
    CaCloudProviderRegionFormDialogComponent,
    CaCloudProviderRegionTableComponent,
    CaSelectCloudProviderRegionOptionsComponent,
    CaCloudProviderRegionInlineComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaConfigCoreModule,
  ],
})
export class CaCloudProviderCoreModule { }
