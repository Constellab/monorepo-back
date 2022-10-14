import {Component, Input, OnInit} from '@angular/core';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {Observable} from 'rxjs';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {FlTextEditorConfig} from '@monorepo/front-core-lib';
import {CaTextEditorConfig} from '../../../../../ca-core/model/config/ca-text-editor-config.class';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';

@Component({
  selector: 'ca-report-detail',
  templateUrl: './ca-report-detail.component.html',
  styleUrls: ['./ca-report-detail.component.scss'],
})
export class CaReportDetailComponent implements OnInit {

  @Input() report: CaReport;

  experiments$: Observable<CaExperiment[]>;
  textEditorConfig: FlTextEditorConfig;

  constructor(private experimentService: CaExperimentService,
              private reportService: CaReportService) {
  }

  ngOnInit(): void {
    this.textEditorConfig = new CaTextEditorConfig(this.reportService, this.report.id);
    this.experiments$ = this.experimentService.getExperimentsByReport(this.report.id);
  }

  printReport(): void {
    if (window) {
      window.print();
    }
  }
}
