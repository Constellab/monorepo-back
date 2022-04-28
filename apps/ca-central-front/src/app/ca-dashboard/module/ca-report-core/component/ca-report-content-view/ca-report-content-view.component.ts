import {Component, Input, OnInit} from '@angular/core';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';
import {Observable} from 'rxjs';
import {RvResourceView} from '@monorepo/resource-view';
import {CaReportViewConfig} from '../../model/ca-report-content-view.class';

@Component({
  selector: 'ca-report-content-view',
  templateUrl: './ca-report-content-view.component.html',
  styleUrls: ['./ca-report-content-view.component.scss']
})
export class CaReportContentViewComponent implements OnInit {

  @Input() viewConfig: CaReportViewConfig;

  view$: Observable<RvResourceView>;

  constructor(private reportService: CaReportService) {
  }

  ngOnInit(): void {
    this.view$ = this.reportService.getView(this.viewConfig.filename);
  };

}
