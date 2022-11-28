import {Component, Input, OnInit} from '@angular/core';
import {CaBucketFull, CaBucketFullDatasource} from '../../../../model/entities/ca-object-storage.class';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaObjectStorageService} from '../../../../service-api/ca-object-storage.service';
import {
  CaBucketFormDialogComponent,
  CaBucketFormDialogInput
} from '../ca-bucket-form-dialog/ca-bucket-form-dialog.component';

@Component({
  selector: 'ca-bucket-table',
  templateUrl: './ca-bucket-table.component.html',
  styleUrls: ['./ca-bucket-table.component.scss']
})
export class CaBucketTableComponent extends FlTableAbstractDirective<CaBucketFull>
  implements OnInit {

  @Input() datasource: CaBucketFullDatasource;

  constructor(private dialogService: FlDialogService,
              private objectStorageService: CaObjectStorageService) {
    super(['contentType', 'region', 'credentials', 'space', 'created', 'lastModified', 'actions']);
  }

  ngOnInit(): void {
  }

  updateBucket(bucket: CaBucketFull): void {
    const input: CaBucketFormDialogInput = {
      mode: 'update',
      object: bucket
    };

    this.dialogService.openSmallDialog(CaBucketFormDialogComponent, {data: input}).afterClosed().subscribe(
      region => this.onUpdateClosed(region)
    );
  }

  private onUpdateClosed(bucket?: CaBucketFull): void {
    if (bucket) {
      this.datasource.updateItem(bucket);
    }
  }

  deleteBucket(bucket: CaBucketFull): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_bucket',
      content: 'delete_bucket_confirm',
      translateTitleAndContent: true,
      observable: this.objectStorageService.deleteBucket(bucket.id),
      successMessage: 'bucket_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, bucket)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult, bucket: CaBucketFull): void {
    if (result.choice) {
      this.datasource.removeItem(bucket);
    }
  }


}
