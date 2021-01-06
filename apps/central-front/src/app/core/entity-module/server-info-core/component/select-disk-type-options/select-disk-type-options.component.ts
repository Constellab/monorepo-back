import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {EmbeddedOptionsAbstractDirective} from '../../../../abstract-directive/embedded-options-abstract.directive';
import {DiskType} from '../../../../model/entities/server-info.class';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'gen-select-disk-type-options',
  templateUrl: './select-disk-type-options.component.html',
  styleUrls: ['./select-disk-type-options.component.scss']
})
export class SelectDiskTypeOptionsComponent extends EmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

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
