import {Component, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaSpace} from '../../../../model/entities/ca-space.class';
import {CaRouterService} from '../../../../service/ca-router.service';

@Component({
  selector: 'ca-space-table',
  templateUrl: './ca-space-table.component.html',
  styleUrls: ['./ca-space-table.component.scss']
})
export class CaSpaceTableComponent extends FlTableAbstractDirective<CaSpace>
  implements OnInit {

  currentSpaceRoute = CaRouterService.getCurrentSpaceRoute();

  constructor() {
    super(['name', 'created', 'lastModified', 'detail']);
  }

  ngOnInit(): void {
  }
}
