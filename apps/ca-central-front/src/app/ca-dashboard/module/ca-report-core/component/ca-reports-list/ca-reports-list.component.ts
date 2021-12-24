import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';

@Component({
  selector: 'ca-reports-list',
  templateUrl: './ca-reports-list.component.html',
  styleUrls: ['./ca-reports-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaReportsListComponent implements OnInit {

  @Input() reports$: Observable<CaReport[]>;

  constructor() {
  }

  ngOnInit(): void {
  }

  getReportLink(report: CaReport): string {
    return CaRouterService.getReportDetailRoute(report.projectId, report.id);
  }

}
