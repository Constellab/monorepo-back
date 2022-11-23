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


@NgModule({
  declarations: [
    CaBucketCredentialsTableComponent,
    CaBucketCredentialsFormDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaOrganizationCoreModule,
    CaCloudProviderCoreModule,
  ],
  exports: [
    CaBucketCredentialsTableComponent,
    CaBucketCredentialsFormDialogComponent
  ]
})
export class CaObjectStorageCoreModule { }
