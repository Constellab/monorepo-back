import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {DiskType} from '../../../../model/entities/server-info.class';
import {MatSelect} from '@angular/material/select';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-select-disk-type-options',
  templateUrl: './select-disk-type-options.component.html',
  styleUrls: ['./select-disk-type-options.component.scss']
})
export class SelectDiskTypeOptionsComponent extends FlEmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

  diskTypes = DiskType;

  constructor(@Host() select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
