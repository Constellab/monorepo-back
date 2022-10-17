import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';

@Component({
  selector: 'ca-report-table',
  templateUrl: './ca-report-table.component.html',
  styleUrls: ['./ca-report-table.component.scss']
})
export class CaReportTableComponent extends FlTableAbstractDirective<CaReport>
  implements OnInit {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() reportSelected: EventEmitter<CaReport> = new EventEmitter();

  constructor() {
    super(['title', 'createdBy', 'lastSync']);
  }

  ngOnInit(): void {
  }

  rowClicked(report: CaReport): void {
    if (this.rowSelectable) {
      this.reportSelected.next(report);
    }
  }

}
