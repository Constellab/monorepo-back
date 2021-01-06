import {Component, OnInit} from '@angular/core';
import {ServerInfo} from '../../../../model/entities/server-info.class';
import {TableAbstractDirective} from '../../../../abstract-directive/table-abstract.directive';
import {FormDialogInput} from '../../../../model/global/form.class';
import {DialogService} from '../../../../service/dialog.service';
import {ServerInfoFormDialogComponent} from '../server-info-form-dialog/server-info-form-dialog.component';

@Component({
  selector: 'gen-server-info-table',
  templateUrl: './server-info-table.component.html',
  styleUrls: ['./server-info-table.component.scss']
})
export class ServerInfoTableComponent extends TableAbstractDirective<ServerInfo> implements OnInit {


  constructor(private dialogService: DialogService) {
    super(['actions']);
  }

  ngOnInit(): void {
  }

  openEditServerInfo(serverInfo: ServerInfo): void {
    const dialogInput: FormDialogInput = {
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
