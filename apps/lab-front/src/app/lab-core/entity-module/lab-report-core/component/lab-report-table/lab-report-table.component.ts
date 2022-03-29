import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlPaginatedTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabReport} from '../../../../model/entities/lab-report.entity';

@Component({
  selector: 'lab-report-table',
  templateUrl: './lab-report-table.component.html',
  styleUrls: ['./lab-report-table.component.scss']
})
export class LabReportTableComponent extends FlPaginatedTableAbstractDirective<LabReport>
  implements OnInit {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() rowSelectable: boolean = false;

  @Output() reportSelected: EventEmitter<LabReport> = new EventEmitter();


  constructor() {
    super(['title', 'isValidated', 'createdAt']);
  }

  ngOnInit(): void {
  }

  rowClicked(report: LabReport): void {
    if (this.rowSelectable) {
      this.reportSelected.next(report);
    }
  }
}
