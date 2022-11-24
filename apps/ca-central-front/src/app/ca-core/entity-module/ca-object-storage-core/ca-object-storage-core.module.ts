import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../../ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  CaBucketCredentialsTableComponent
} from './component/ca-bucket-credentials-table/ca-bucket-credentials-table.component';
import {
  CaBucketCredentialsFormDialogComponent
} from './component/ca-bucket-credentials-form-dialog/ca-bucket-credentials-form-dialog.component';
import {CaOrganizationCoreModule} from '../ca-organization-core/ca-organization-core.module';
import {CaCloudProviderCoreModule} from '../ca-cloud-provider-core/ca-cloud-provider-core.module';
import {
  CaBucketRegionFormDialogComponent
} from './component/ca-bucket-region-form-dialog/ca-bucket-region-form-dialog.component';
import {CaBucketRegionTableComponent} from './component/ca-bucket-region-table/ca-bucket-region-table.component';
import {
  CaSelectBucketRegionOptionsComponent
} from './component/ca-select-bucket-region-options/ca-select-bucket-region-options.component';
import {
  CaSelectBucketCredentialsOptionsComponent
} from './component/ca-select-bucket-credentials-options/ca-select-bucket-credentials-options.component';
import {CaConfigCoreModule} from '../ca-config-core/ca-config-core.module';
import {CaBucketFormDialogComponent} from './component/ca-bucket-form-dialog/ca-bucket-form-dialog.component';
import {CaBucketTableComponent} from './component/ca-bucket-table/ca-bucket-table.component';
import {CaBucketRegionInlineComponent} from './component/ca-bucket-region-inline/ca-bucket-region-inline.component';
import {
  CaBucketCredentialsInlineComponent
} from './component/ca-bucket-credentials-inline/ca-bucket-credentials-inline.component';


@NgModule({
  declarations: [
    CaBucketCredentialsTableComponent,
    CaBucketCredentialsFormDialogComponent,
    CaBucketRegionFormDialogComponent,
    CaBucketRegionTableComponent,
    CaSelectBucketRegionOptionsComponent,
    CaSelectBucketCredentialsOptionsComponent,
    CaBucketFormDialogComponent,
    CaBucketTableComponent,
    CaBucketRegionInlineComponent,
    CaBucketCredentialsInlineComponent
  ],
  exports: [
    CaBucketCredentialsTableComponent,
    CaBucketCredentialsFormDialogComponent,
    CaBucketRegionFormDialogComponent,
    CaBucketRegionTableComponent,
    CaSelectBucketRegionOptionsComponent,
    CaSelectBucketCredentialsOptionsComponent,
    CaBucketFormDialogComponent,
    CaBucketTableComponent,
    CaBucketRegionInlineComponent,
    CaBucketCredentialsInlineComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaOrganizationCoreModule,
    CaCloudProviderCoreModule,
    CaConfigCoreModule,
  ],
})
export class CaObjectStorageCoreModule {
}
