import {Component, Input, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaCloudProvider, CaCloudProviderDatasource} from '../../../../model/entities/ca-cloud-provider.class';
import {CaCloudProviderService} from '../../../../service-api/ca-cloud-provider.service';
import {
  CaCloudProviderFormDialogComponent,
  CaCloudProviderFormDialogInput
} from '../ca-cloud-provider-form-dialog/ca-cloud-provider-form-dialog.component';

@Component({
  selector: 'ca-cloud-provider-table',
  templateUrl: './ca-cloud-provider-table.component.html',
  styleUrls: ['./ca-cloud-provider-table.component.scss']
})
export class CaCloudProviderTableComponent extends FlTableAbstractDirective<CaCloudProvider>
  implements OnInit {

  @Input() datasource: CaCloudProviderDatasource;

  constructor(private cloudProviderService: CaCloudProviderService,
              private dialogService: FlDialogService) {
    super(['created', 'lastModified', 'actions']);
  }

  ngOnInit(): void {
  }

  updateCloudProvider(cloudProvider: CaCloudProvider): void {
    const input: CaCloudProviderFormDialogInput = {
      mode: 'update',
      object: cloudProvider
    };

    this.dialogService.openSmallDialog(CaCloudProviderFormDialogComponent, {data: input}).afterClosed().subscribe(
      cloudProvider => this.onUpdateClosed(cloudProvider)
    );
  }

  private onUpdateClosed(cloudProvider?: CaCloudProvider): void {
    if (cloudProvider) {
      this.datasource.updateItem(cloudProvider);
    }
  }

  deleteCloudProvider(cloudProvider: CaCloudProvider): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_cloud_provider',
      content: 'delete_cloud_provider_confirm',
      translateTitleAndContent: true,
      observable: this.cloudProviderService.delete(cloudProvider.id),
      successMessage: 'cloud_provider_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, cloudProvider)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult, cloudProvider: CaCloudProvider): void {
    if (result.choice) {
      this.datasource.removeItem(cloudProvider);
    }
  }


}
