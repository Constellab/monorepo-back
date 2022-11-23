import {Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {
  CaBucketCredentialsFull,
  CaBucketCredentialsFullDatasource
} from '../../../../model/entities/ca-object-storage.class';
import {
  CaBucketCredentialsFormDialogComponent,
  CaBucketCredentialsFormDialogInput
} from '../ca-bucket-credentials-form-dialog/ca-bucket-credentials-form-dialog.component';
import {CaObjectStorageService} from '../../../../service-api/ca-object-storage.service';

@Component({
  selector: 'ca-bucket-credentials-table',
  templateUrl: './ca-bucket-credentials-table.component.html',
  styleUrls: ['./ca-bucket-credentials-table.component.scss']
})
export class CaBucketCredentialsTableComponent extends FlTableAbstractDirective<CaBucketCredentialsFull>
  implements OnInit {

  @Input() datasource: CaBucketCredentialsFullDatasource;

  constructor(private dialogService: FlDialogService,
              private objectStorageService: CaObjectStorageService) {
    super(['organization', 'cloudProvider', 'created', 'lastModified', 'actions']);
  }

  ngOnInit(): void {
  }

  updateBucketCredential(credentials: CaBucketCredentialsFull): void {
    const input: CaBucketCredentialsFormDialogInput = {
      mode: 'update',
      object: credentials
    };

    this.dialogService.openSmallDialog(CaBucketCredentialsFormDialogComponent, {data: input}).afterClosed().subscribe(
      credentials => this.onUpdateClosed(credentials)
    );
  }

  private onUpdateClosed(credentials?: CaBucketCredentialsFull): void {
    if (credentials) {
      this.datasource.updateItem(credentials);
    }
  }

  deleteBucketCredentials(credentials: CaBucketCredentialsFull): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_bucket_credentials',
      content: 'delete_bucket_credentials_confirm',
      translateTitleAndContent: true,
      observable: this.objectStorageService.deleteCredentials(credentials.id),
      successMessage: 'bucket_credentials_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, credentials)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult, credentials: CaBucketCredentialsFull): void {
    if (result.choice) {
      this.datasource.removeItem(credentials);
    }
  }


}
