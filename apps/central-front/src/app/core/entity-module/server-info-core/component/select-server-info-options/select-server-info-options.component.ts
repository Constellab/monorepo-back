import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {ServerInfoService} from '../../../../service-api/server-info.service';
import {ServerInfo} from '../../../../model/entities/server-info.class';
import {MatSelect} from '@angular/material/select';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-select-server-info-options',
  templateUrl: './select-server-info-options.component.html',
  styleUrls: ['./select-server-info-options.component.scss']
})
export class SelectServerInfoOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  serversInfo: ServerInfo[];

  isLoading: boolean = false;

  constructor(private serverInfoService: ServerInfoService,
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

  private getServersInfoSuccess(serversInfo: ServerInfo[]): void {
    this.isLoading = false;
    this.serversInfo = serversInfo;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
