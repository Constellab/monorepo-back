import {Component, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';

@Component({
  selector: 'ca-report-table',
  templateUrl: './ca-report-table.component.html',
  styleUrls: ['./ca-report-table.component.scss']
})
export class CaReportTableComponent extends FlTableAbstractDirective<CaReport>
  implements OnInit {

  constructor() {
    super(['title', 'lastSync', 'status']);
  }

  ngOnInit(): void {
  }

  getReportRoute(report: CaReport): string {
    return CaRouterService.getReportDetailRoute(report.projectId, report.id);
  }
}
