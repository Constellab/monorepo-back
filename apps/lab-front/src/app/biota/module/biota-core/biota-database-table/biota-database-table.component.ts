import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FlPaginatedTableAbstractDirective} from '@monorepo/front-core-lib';
import {BiotaData} from '../../../model/biota-data.class';

@Component({
  selector: 'gen-biota-database-table',
  templateUrl: './biota-database-table.component.html',
  styleUrls: ['./biota-database-table.component.scss']
})
export class BiotaDatabaseTableComponent extends FlPaginatedTableAbstractDirective<BiotaData>
  implements OnInit {

  @Output() showDetail: EventEmitter<BiotaData> = new EventEmitter();


  constructor() {
    super(['id', 'name']);
  }

  ngOnInit(): void {
  }


  onShowDetail(data: BiotaData): void {
    this.showDetail.emit(data);
  }

}
