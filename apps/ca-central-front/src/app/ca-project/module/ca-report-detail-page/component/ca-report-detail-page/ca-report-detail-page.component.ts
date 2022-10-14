import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';

@Component({
  selector: 'ca-report-detail-page',
  templateUrl: './ca-report-detail-page.component.html',
  styleUrls: ['./ca-report-detail-page.component.scss']
})
export class CaReportDetailPageComponent implements OnInit {

  reportId$: Observable<string>;
  report$: Observable<CaReport>;

  constructor(private reportService: CaReportService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
    this.reportId$ = this.route.params.pipe(
      map(params => params.id)
    );
  }

  private init(id: string): void {
    this.report$ = this.reportService.getById(id);
  }
}
