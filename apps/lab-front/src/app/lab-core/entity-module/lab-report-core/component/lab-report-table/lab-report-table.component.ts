import {Component, OnInit} from '@angular/core';
import {FlPaginatedTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabReport} from '../../../../model/entities/lab-report.entity';

@Component({
  selector: 'lab-report-table',
  templateUrl: './lab-report-table.component.html',
  styleUrls: ['./lab-report-table.component.scss']
})
export class LabReportTableComponent extends FlPaginatedTableAbstractDirective<LabReport>
  implements OnInit {

  constructor() {
    super(['isValidated', 'createdAt'])
  }

  ngOnInit(): void {
  }
}
