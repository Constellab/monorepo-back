import {Component, OnInit} from '@angular/core';
import {ServerInfo} from '../../../core/model/entities/server-info.class';
import {ServerInfoService} from '../../../core/service-api/server-info.service';
import {ServerInfoFormDialogComponent} from '../../../core/entity-module/server-info-core/component/server-info-form-dialog/server-info-form-dialog.component';
import {FlArrayObs, FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';

/**
 * List of all server info and possibility to add one
 */
@Component({
  selector: 'gen-admin-server-info-list',
  templateUrl: './admin-server-info-list.component.html',
  styleUrls: ['./admin-server-info-list.component.scss']
})
export class AdminServerInfoListComponent implements OnInit {

  serversInfo: FlArrayObs<ServerInfo>;

  displayedColumns: FlTableColumn<ServerInfo>[] = ['host', 'name', 'ram', 'diskSpace', 'diskType',
    'cpuCount', 'cpuType', 'gpuCount', 'gpuType', 'actions'];

  constructor(private serverInfoService: ServerInfoService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.getServersInfo();
  }

  private getServersInfo(): void {
    this.serversInfo = this.serverInfoService.findAllArrayObs();
  }

  openCreateServerInfo(): void {
    const dialogInput: FlFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(ServerInfoFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      serverInfo => this.onCreateServerInfo(serverInfo)
    );
  }

  private onCreateServerInfo(serverInfo?: ServerInfo): void {
    if (serverInfo) {
      this.serversInfo.unshiftItem(serverInfo);
    }
  }

}
