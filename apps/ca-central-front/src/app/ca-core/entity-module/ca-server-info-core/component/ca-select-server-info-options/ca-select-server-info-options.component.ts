import {AfterViewInit, Component, Host, OnDestroy, OnInit} from '@angular/core';
import {CaServerInfoService} from '../../../../service-api/ca-server-info.service';
import {CaServerInfo, CaServerInfoDatasource} from '../../../../model/entities/ca-server-info.class';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

@Component({
  selector: 'ca-select-server-info-options',
  templateUrl: './ca-select-server-info-options.component.html',
  styleUrls: ['./ca-select-server-info-options.component.scss']
})
export class CaSelectServerInfoOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  datasource: CaServerInfoDatasource;
  serverInfo$: Observable<CaServerInfo[]>;


  constructor(private serverInfoService: CaServerInfoService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.datasource = this.serverInfoService.findAllDatasource();
    this.serverInfo$ = this.datasource.connect();
  }


  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource.disconnect();
  }


}
