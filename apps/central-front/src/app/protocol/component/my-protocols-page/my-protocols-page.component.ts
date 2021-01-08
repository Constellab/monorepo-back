import {Component, OnInit} from '@angular/core';
import {Protocol, ProtocolDatasource} from '../../../core/model/entities/protocol.entity';
import {ProtocolService} from '../../../core/service-api/protocol.service';
import {ProtocolFormDialogComponent} from '../../../core/entity-module/protocol-core/component/protocol-form-dialog/protocol-form-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-my-protocols-page',
  templateUrl: './my-protocols-page.component.html',
  styleUrls: ['./my-protocols-page.component.scss']
})
export class MyProtocolsPageComponent implements OnInit {

  protocolsDatasource: ProtocolDatasource;

  constructor(private protocolService: ProtocolService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.getMyProtocols();
  }

  private getMyProtocols(): void {
    this.protocolsDatasource = this.protocolService.getMyProtocolsDatasource();
  }

  createProtocol(): void {
    this.dialogService.openMediumDialog(ProtocolFormDialogComponent).afterClosed().subscribe(
      protocol => this.onCreateProtocolClose(protocol)
    );
  }

  private onCreateProtocolClose(protocol ?: Protocol): void {
    if (protocol) {
      // add item at start
      this.protocolsDatasource.addItem(protocol, () => true);
    }
  }

}
