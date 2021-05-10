import {Component, Input, OnInit} from '@angular/core';
import {ServerInfo} from '../../../../model/entities/server-info.class';
import {ServerInfoFormDialogComponent} from '../server-info-form-dialog/server-info-form-dialog.component';
import {FlArrayObs, FlDialogService, FlFormDialogInput, FlTableAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-server-info-table',
  templateUrl: './server-info-table.component.html',
  styleUrls: ['./server-info-table.component.scss']
})
export class ServerInfoTableComponent extends FlTableAbstractDirective<ServerInfo> implements OnInit {

  @Input() datasource: FlArrayObs<ServerInfo>;

  constructor(private dialogService: FlDialogService) {
    super(['actions']);
  }

  ngOnInit(): void {
  }

  openEditServerInfo(serverInfo: ServerInfo): void {
    const dialogInput: FlFormDialogInput = {
      mode: 'update',
      object: serverInfo
    };
    this.dialogService.openSmallDialog(ServerInfoFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      result => this.onOpenEditServerInfo(result)
    );
  }

  private onOpenEditServerInfo(serverInfo?: ServerInfo): void {
    if (serverInfo) {
      this.datasource.updateItem(serverInfo);
    }
  }

}
