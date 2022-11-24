import {Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaBucketRegion, CaBucketRegionDatasource} from '../../../../model/entities/ca-object-storage.class';
import {CaObjectStorageService} from '../../../../service-api/ca-object-storage.service';
import {
  CaBucketRegionFormDialogComponent,
  CaBucketRegionFormDialogInput
} from '../ca-bucket-region-form-dialog/ca-bucket-region-form-dialog.component';

@Component({
  selector: 'ca-bucket-region-table',
  templateUrl: './ca-bucket-region-table.component.html',
  styleUrls: ['./ca-bucket-region-table.component.scss']
})
export class CaBucketRegionTableComponent extends FlTableAbstractDirective<CaBucketRegion>
  implements OnInit {

  @Input() datasource: CaBucketRegionDatasource;

  constructor(private dialogService: FlDialogService,
              private objectStorageService: CaObjectStorageService) {
    super(['technicalName', 'cloudProvider', 'city', 'created', 'lastModified', 'actions']);
  }

  ngOnInit(): void {
  }

  updateBucketRegion(region: CaBucketRegion): void {
    const input: CaBucketRegionFormDialogInput = {
      mode: 'update',
      object: region
    };

    this.dialogService.openSmallDialog(CaBucketRegionFormDialogComponent, {data: input}).afterClosed().subscribe(
      region => this.onUpdateClosed(region)
    );
  }

  private onUpdateClosed(region?: CaBucketRegion): void {
    if (region) {
      this.datasource.updateItem(region);
    }
  }

  deleteBucketRegion(region: CaBucketRegion): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_bucket_region',
      content: 'delete_bucket_region_confirm',
      translateTitleAndContent: true,
      observable: this.objectStorageService.deleteRegion(region.id),
      successMessage: 'bucket_region_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, region)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult, region: CaBucketRegion): void {
    if (result.choice) {
      this.datasource.removeItem(region);
    }
  }

}
