import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {ServerHost} from '../../../../model/entities/server-info.class';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-select-server-info-host-options',
  templateUrl: './select-server-info-host-options.component.html',
  styleUrls: ['./select-server-info-host-options.component.scss']
})
export class SelectServerInfoHostOptionsComponent extends FlEmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

  serverHosts = ServerHost;

  constructor(@Host() select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
