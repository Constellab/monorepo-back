import {Component, OnInit} from '@angular/core';
import {FlPaginatedTableAbstractDirective} from '@monorepo/front-core-lib';
import {BiotaData} from '../../../../model/biota-data.class';

@Component({
  selector: 'gen-biota-database-table',
  templateUrl: './biota-database-table.component.html',
  styleUrls: ['./biota-database-table.component.scss']
})
export class BiotaDatabaseTableComponent extends FlPaginatedTableAbstractDirective<BiotaData>
  implements OnInit {


  constructor() {
    super(['title', 'definition']);
  }

  ngOnInit(): void {
  }

}
