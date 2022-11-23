import {Component, OnInit} from '@angular/core';
import {CaBucketRegion, CaBucketRegionDatasource} from '../../../ca-core/model/entities/ca-object-storage.class';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {CaObjectStorageService} from '../../../ca-core/service-api/ca-object-storage.service';
import {
  CaBucketRegionFormDialogComponent,
  CaBucketRegionFormDialogInput
} from '../../../ca-core/entity-module/ca-object-storage-core/component/ca-bucket-region-form-dialog/ca-bucket-region-form-dialog.component';

@Component({
  selector: 'ca-admin-bucket-regions-list',
  templateUrl: './ca-admin-bucket-regions-list.component.html',
  styleUrls: ['./ca-admin-bucket-regions-list.component.scss']
})
export class CaAdminBucketRegionsListComponent implements OnInit {

  regions: CaBucketRegionDatasource = this.objectStorageService.getAllRegionsDatasource();

  displayedColumns: FlTableColumn<CaBucketRegion>[] =
    ['technicalName', 'cloudProvider', 'city', 'created', 'lastModified', 'actions'];

  constructor(private objectStorageService: CaObjectStorageService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openCreateDialog(): void {
    const input: CaBucketRegionFormDialogInput = {
      mode: 'create',
    };

    this.dialogService.openSmallDialog(CaBucketRegionFormDialogComponent,
      {data: input}).afterClosed().subscribe(
      region => this.onCreateClosed(region)
    );
  }

  private onCreateClosed(region ?: CaBucketRegion): void {
    if (region) {
      this.regions.addItem(region);
    }
  }


}
