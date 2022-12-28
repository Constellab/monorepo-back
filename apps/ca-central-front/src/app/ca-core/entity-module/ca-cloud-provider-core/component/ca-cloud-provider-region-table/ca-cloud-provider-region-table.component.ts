import {Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {
  CaCloudProviderRegionFormDialogComponent,
  CaCloudProviderRegionFormDialogInput
} from '../ca-cloud-provider-region-form-dialog/ca-cloud-provider-region-form-dialog.component';
import {CaCloudProviderService} from '../../../../service-api/ca-cloud-provider.service';
import {
  CaCloudProviderRegion,
  CaCloudProviderRegionDatasource
} from '../../../../model/entities/ca-cloud-provider.class';

@Component({
  selector: 'ca-bucket-region-table',
  templateUrl: './ca-cloud-provider-region-table.component.html',
  styleUrls: ['./ca-cloud-provider-region-table.component.scss']
})
export class CaCloudProviderRegionTableComponent extends FlTableAbstractDirective<CaCloudProviderRegion>
  implements OnInit {

  @Input() datasource: CaCloudProviderRegionDatasource;

  constructor(private dialogService: FlDialogService,
              private cloudProviderService: CaCloudProviderService) {
    super(['technicalName', 'cloudProvider', 'city', 'created', 'lastModified', 'actions']);
  }

  ngOnInit(): void {
  }

  updateRegion(region: CaCloudProviderRegion): void {
    const input: CaCloudProviderRegionFormDialogInput = {
      mode: 'update',
      object: region
    };

    this.dialogService.openSmallDialog(CaCloudProviderRegionFormDialogComponent, {data: input}).afterClosed().subscribe(
      region => this.onUpdateClosed(region)
    );
  }

  private onUpdateClosed(region?: CaCloudProviderRegion): void {
    if (region) {
      this.datasource.updateItem(region);
    }
  }

  deleteRegion(region: CaCloudProviderRegion): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_cloud_provider_region',
      content: 'delete_cloud_provider_region_confirm',
      translateTitleAndContent: true,
      observable: this.cloudProviderService.deleteRegion(region.id),
      successMessage: 'cloud_provider_region_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, region)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult, region: CaCloudProviderRegion): void {
    if (result.choice) {
      this.datasource.removeItem(region);
    }
  }

}
