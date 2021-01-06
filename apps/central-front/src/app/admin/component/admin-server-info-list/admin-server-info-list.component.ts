import {Component, OnInit} from '@angular/core';
import {ServerInfo} from '../../../core/model/entities/server-info.class';
import {ServerInfoService} from '../../../core/service-api/server-info.service';
import {ArrayObs} from '../../../core/model/datasource/array-obs.class';
import {TableColumn} from '../../../core/abstract-directive/table-abstract.directive';
import {FormDialogInput} from '../../../core/model/global/form.class';
import {DialogService} from '../../../core/service/dialog.service';
import {ServerInfoFormDialogComponent} from '../../../core/entity-module/server-info-core/component/server-info-form-dialog/server-info-form-dialog.component';

/**
 * List of all server info and possibility to add one
 */
@Component({
  selector: 'gen-admin-server-info-list',
  templateUrl: './admin-server-info-list.component.html',
  styleUrls: ['./admin-server-info-list.component.scss']
})
export class AdminServerInfoListComponent implements OnInit {

  serversInfo: ArrayObs<ServerInfo>;

  displayedColumns: TableColumn<ServerInfo>[] = ['host', 'name', 'ram', 'diskSpace', 'diskType',
    'cpuCount', 'cpuType', 'gpuCount', 'gpuType', 'actions'];

  constructor(private serverInfoService: ServerInfoService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.getServersInfo();
  }

  private getServersInfo(): void {
    this.serversInfo = this.serverInfoService.findAllArrayObs();
  }

  openCreateServerInfo(): void {
    const dialogInput: FormDialogInput = {
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
