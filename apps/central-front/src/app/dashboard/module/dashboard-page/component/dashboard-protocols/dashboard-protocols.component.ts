import {Component, OnInit} from '@angular/core';
import {ProtocolDatasource} from '../../../../../core/model/entities/protocol.entity';
import {ProtocolService} from '../../../../../core/service-api/protocol.service';
import {RouterService} from '../../../../../core/service/router.service';

@Component({
  selector: 'gen-dashboard-protocols',
  templateUrl: './dashboard-protocols.component.html',
  styleUrls: ['./dashboard-protocols.component.scss']
})
export class DashboardProtocolsComponent implements OnInit {

  protocolsDatasource: ProtocolDatasource;

  myProtocolsRoute: string = RouterService.getMyProtocolsRoute();

  constructor(private protocolService: ProtocolService) {
  }

  ngOnInit(): void {
    this.getMyProtocols();
  }

  private getMyProtocols(): void {
    this.protocolsDatasource = this.protocolService.getDashboardMyProtocolsDatasource();
  }


}
