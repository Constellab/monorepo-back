import {Component, Input, OnInit} from '@angular/core';
import {FlArrayObs, FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {HaBrickVersion} from '../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';

@Component({
  selector: 'ha-public-brick-versions-table',
  templateUrl: './ha-public-brick-versions-table.component.html',
  styleUrls: ['./ha-public-brick-versions-table.component.scss']
})
export class HaPublicBrickVersionsTableComponent extends FlTableAbstractDirective<HaBrickVersion> implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
