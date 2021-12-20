import {Component, Input, OnInit} from '@angular/core';
import {CaServerInfo} from '../../../../model/entities/ca-server-info.class';
import {CaServerInfoFormDialogComponent} from '../ca-server-info-form-dialog/ca-server-info-form-dialog.component';
import {FlArrayObs, FlDialogService, FlFormDialogInput, FlTableAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-server-info-table',
  templateUrl: './ca-server-info-table.component.html',
  styleUrls: ['./ca-server-info-table.component.scss']
})
export class CaServerInfoTableComponent extends FlTableAbstractDirective<CaServerInfo> implements OnInit {

  @Input() datasource: FlArrayObs<CaServerInfo>;

  constructor(private dialogService: FlDialogService) {
    super(['actions']);
  }

  ngOnInit(): void {
  }

  openEditServerInfo(serverInfo: CaServerInfo): void {
    const dialogInput: FlFormDialogInput = {
      mode: 'update',
      object: serverInfo
    };
    this.dialogService.openSmallDialog(CaServerInfoFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      result => this.onOpenEditServerInfo(result)
    );
  }

  private onOpenEditServerInfo(serverInfo?: CaServerInfo): void {
    if (serverInfo) {
      this.datasource.updateItem(serverInfo);
    }
  }

}
