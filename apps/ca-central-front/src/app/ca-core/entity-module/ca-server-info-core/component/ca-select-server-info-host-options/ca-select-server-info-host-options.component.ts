import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {CaServerHost} from '../../../../model/entities/ca-server-info.class';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-select-server-info-host-options',
  templateUrl: './ca-select-server-info-host-options.component.html',
  styleUrls: ['./ca-select-server-info-host-options.component.scss']
})
export class CaSelectServerInfoHostOptionsComponent extends FlEmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

  serverHosts = CaServerHost;

  constructor(@Host() select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
