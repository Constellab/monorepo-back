import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {CaDiskType} from '../../../../model/entities/ca-server-info.class';
import {MatSelect} from '@angular/material/select';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-select-disk-type-options',
  templateUrl: './ca-select-disk-type-options.component.html',
  styleUrls: ['./ca-select-disk-type-options.component.scss']
})
export class CaSelectDiskTypeOptionsComponent extends FlEmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

  diskTypes = CaDiskType;

  constructor(@Host() select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
