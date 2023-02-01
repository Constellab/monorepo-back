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
import {CaSpaceCoreModule} from '../ca-space-core/ca-space-core.module';
import {CaCloudProviderCoreModule} from '../ca-cloud-provider-core/ca-cloud-provider-core.module';
import {
  CaSelectBucketCredentialsOptionsComponent
} from './component/ca-select-bucket-credentials-options/ca-select-bucket-credentials-options.component';
import {CaConfigCoreModule} from '../ca-config-core/ca-config-core.module';
import {CaBucketFormDialogComponent} from './component/ca-bucket-form-dialog/ca-bucket-form-dialog.component';
import {CaBucketTableComponent} from './component/ca-bucket-table/ca-bucket-table.component';
import {
  CaBucketCredentialsInlineComponent
} from './component/ca-bucket-credentials-inline/ca-bucket-credentials-inline.component';
import {CaBucketInfoComponent} from './component/ca-bucket-info/ca-bucket-info.component';


@NgModule({
  declarations: [
    CaBucketCredentialsTableComponent,
    CaBucketCredentialsFormDialogComponent,
    CaSelectBucketCredentialsOptionsComponent,
    CaBucketFormDialogComponent,
    CaBucketTableComponent,
    CaBucketCredentialsInlineComponent,
    CaBucketInfoComponent
  ],
  exports: [
    CaBucketCredentialsTableComponent,
    CaBucketCredentialsFormDialogComponent,
    CaSelectBucketCredentialsOptionsComponent,
    CaBucketFormDialogComponent,
    CaBucketTableComponent,
    CaBucketCredentialsInlineComponent,
    CaBucketInfoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaSpaceCoreModule,
    CaCloudProviderCoreModule,
    CaConfigCoreModule,
  ],
})
export class CaObjectStorageCoreModule {
}
