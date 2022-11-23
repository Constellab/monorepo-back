import {Component, OnInit} from '@angular/core';
import {CaServerInfo, CaServerInfoDatasource} from '../../../ca-core/model/entities/ca-server-info.class';
import {CaServerInfoService} from '../../../ca-core/service-api/ca-server-info.service';
import {
  CaServerInfoFormDialogComponent
} from '../../../ca-core/entity-module/ca-server-info-core/component/ca-server-info-form-dialog/ca-server-info-form-dialog.component';
import {FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';

/**
 * List of all server info and possibility to add one
 */
@Component({
  selector: 'ca-admin-server-info-list',
  templateUrl: './ca-admin-server-info-list.component.html',
  styleUrls: ['./ca-admin-server-info-list.component.scss']
})
export class CaAdminServerInfoListComponent implements OnInit {

  serversInfo: CaServerInfoDatasource = this.serverInfoService.findAllDatasource();

  displayedColumns: FlTableColumn<CaServerInfo>[] = ['cloudProvider', 'name', 'ram', 'diskSpace', 'diskType',
    'cpuCount', 'cpuType', 'gpuCount', 'gpuType', 'actions'];

  constructor(private serverInfoService: CaServerInfoService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }


  openCreateServerInfo(): void {
    const dialogInput: FlFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaServerInfoFormDialogComponent, {data: dialogInput}).afterClosed()
      .subscribe(
        serverInfo => this.onCreateServerInfo(serverInfo)
      );
  }

  private onCreateServerInfo(serverInfo?: CaServerInfo): void {
    if (serverInfo) {
      this.serversInfo.unshiftItem(serverInfo);
    }
  }

}
