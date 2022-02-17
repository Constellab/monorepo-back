import {Component, Input, OnInit} from '@angular/core';
import {CaLabConfig} from '../../../../model/entities/ca-lab-config.class';
import {FlArrayObs, FlTableAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-lab-config-table',
  templateUrl: './ca-lab-config-table.component.html',
  styleUrls: ['./ca-lab-config-table.component.scss']
})
export class CaLabConfigTableComponent extends FlTableAbstractDirective<CaLabConfig> implements OnInit {

  @Input() datasource: FlArrayObs<CaLabConfig>;

  constructor() {
    super(['createdAt', 'lastModifiedAt']);
  }

  ngOnInit(): void {
  }
}
