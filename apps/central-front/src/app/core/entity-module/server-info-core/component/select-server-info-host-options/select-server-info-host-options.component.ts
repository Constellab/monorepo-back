import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {EmbeddedOptionsAbstractDirective} from '../../../../abstract-directive/embedded-options-abstract.directive';
import {MatSelect} from '@angular/material/select';
import {ServerHost} from '../../../../model/entities/server-info.class';

@Component({
  selector: 'gen-select-server-info-host-options',
  templateUrl: './select-server-info-host-options.component.html',
  styleUrls: ['./select-server-info-host-options.component.scss']
})
export class SelectServerInfoHostOptionsComponent extends EmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

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
