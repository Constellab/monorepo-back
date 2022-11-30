import {Component, OnInit} from '@angular/core';
import {
  CaBucketCredentialsFull,
  CaBucketCredentialsFullDatasource
} from '../../../ca-core/model/entities/ca-object-storage.class';
import {CaObjectStorageService} from '../../../ca-core/service-api/ca-object-storage.service';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaBucketCredentialsFormDialogComponent,
  CaBucketCredentialsFormDialogInput
} from '../../../ca-core/entity-module/ca-object-storage-core/component/ca-bucket-credentials-form-dialog/ca-bucket-credentials-form-dialog.component';

/**
 * List bucket credentials with CRUD actions
 */
@Component({
  selector: 'ca-admin-bucket-credentials-list',
  templateUrl: './ca-admin-bucket-credentials-list.component.html',
  styleUrls: ['./ca-admin-bucket-credentials-list.component.scss']
})
export class CaAdminBucketCredentialsListComponent implements OnInit {

  bucketCredentials: CaBucketCredentialsFullDatasource = this.objectStorageService.getAllCredentialsDatasource();

  displayedColumns: FlTableColumn<CaBucketCredentialsFull>[] =
    ['name', 'cloudProvider', 'space', 's3Username', 'lastModified', 'actions'];

  constructor(private objectStorageService: CaObjectStorageService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openCreateDialog(): void {
    const input: CaBucketCredentialsFormDialogInput = {
      mode: 'create',
    };

    this.dialogService.openSmallDialog(CaBucketCredentialsFormDialogComponent, {data: input}).afterClosed().subscribe(
      credentials => this.onCreateClosed(credentials)
    );
  }

  private onCreateClosed(credentials?: CaBucketCredentialsFull): void {
    if (credentials) {
      this.bucketCredentials.addItem(credentials);
    }
  }

}
