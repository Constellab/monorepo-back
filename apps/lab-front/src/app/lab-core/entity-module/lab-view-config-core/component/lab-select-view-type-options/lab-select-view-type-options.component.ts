import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {labConstResourceViewTypeInfos} from '../../../../model/entities/resource/lab-resource-view.entity';

@Component({
  selector: 'lab-select-view-type-options',
  templateUrl: './lab-select-view-type-options.component.html',
  styleUrls: ['./lab-select-view-type-options.component.scss']
})
export class LabSelectViewTypeOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  viewTypes = labConstResourceViewTypeInfos;

  constructor(@Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }
}
