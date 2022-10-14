import {Component, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';

@Component({
  selector: 'ca-report-table',
  templateUrl: './ca-report-table.component.html',
  styleUrls: ['./ca-report-table.component.scss']
})
export class CaReportTableComponent extends FlTableAbstractDirective<CaReport>
  implements OnInit {

  constructor() {
    super(['title', 'createdBy', 'lastSync',]);
  }

  ngOnInit(): void {
  }

}
