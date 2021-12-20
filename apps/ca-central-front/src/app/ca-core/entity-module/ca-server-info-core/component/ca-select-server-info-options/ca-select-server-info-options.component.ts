import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {CaServerInfoService} from '../../../../service-api/ca-server-info.service';
import {CaServerInfo} from '../../../../model/entities/ca-server-info.class';
import {MatSelect} from '@angular/material/select';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-select-server-info-options',
  templateUrl: './ca-select-server-info-options.component.html',
  styleUrls: ['./ca-select-server-info-options.component.scss']
})
export class CaSelectServerInfoOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  serversInfo: CaServerInfo[];

  isLoading: boolean = false;

  constructor(private serverInfoService: CaServerInfoService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.getServersInfo();
  }

  private getServersInfo(): void {
    this.isLoading = true;
    this.serverInfoService.findAll().subscribe(
      serversInfo => this.getServersInfoSuccess(serversInfo),
      () => this.isLoading = false
    );
  }

  private getServersInfoSuccess(serversInfo: CaServerInfo[]): void {
    this.isLoading = false;
    this.serversInfo = serversInfo;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
