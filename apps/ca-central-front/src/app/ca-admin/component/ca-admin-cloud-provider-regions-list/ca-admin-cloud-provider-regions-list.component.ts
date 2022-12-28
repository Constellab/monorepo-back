import {Component, OnInit} from '@angular/core';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaCloudProviderRegionFormDialogComponent,
  CaCloudProviderRegionFormDialogInput
} from '../../../ca-core/entity-module/ca-cloud-provider-core/component/ca-cloud-provider-region-form-dialog/ca-cloud-provider-region-form-dialog.component';
import {CaCloudProviderService} from '../../../ca-core/service-api/ca-cloud-provider.service';
import {
  CaCloudProviderRegion,
  CaCloudProviderRegionDatasource
} from '../../../ca-core/model/entities/ca-cloud-provider.class';

@Component({
  selector: 'ca-admin-bucket-regions-list',
  templateUrl: './ca-admin-cloud-provider-regions-list.component.html',
  styleUrls: ['./ca-admin-cloud-provider-regions-list.component.scss']
})
export class CaAdminCloudProviderRegionsListComponent implements OnInit {

  regions: CaCloudProviderRegionDatasource = this.cloudProviderService.getAllRegionsDatasource();

  displayedColumns: FlTableColumn<CaCloudProviderRegion>[] =
    ['technicalName', 'cloudProvider', 'city', 'created', 'lastModified', 'actions'];

  constructor(private cloudProviderService: CaCloudProviderService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openCreateDialog(): void {
    const input: CaCloudProviderRegionFormDialogInput = {
      mode: 'create',
    };

    this.dialogService.openSmallDialog(CaCloudProviderRegionFormDialogComponent,
      {data: input}).afterClosed().subscribe(
      region => this.onCreateClosed(region)
    );
  }

  private onCreateClosed(region ?: CaCloudProviderRegion): void {
    if (region) {
      this.regions.addItem(region);
    }
  }


}
