import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlDatasourcePaginated, FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabBiotaData} from '../../../model/lab-biota-data.class';

@Component({
  selector: 'lab-biota-database-table',
  templateUrl: './lab-biota-database-table.component.html',
  styleUrls: ['./lab-biota-database-table.component.scss']
})
export class LabBiotaDatabaseTableComponent extends FlTableAbstractDirective<LabBiotaData>
  implements OnInit {

  @Input() datasource: FlDatasourcePaginated<LabBiotaData>;


  @Output() showDetail: EventEmitter<LabBiotaData> = new EventEmitter();


  constructor() {
    super(['id', 'name']);
  }

  ngOnInit(): void {
  }


  onShowDetail(data: LabBiotaData): void {
    this.showDetail.emit(data);
  }

}
