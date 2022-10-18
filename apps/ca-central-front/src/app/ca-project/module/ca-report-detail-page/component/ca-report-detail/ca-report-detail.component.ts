import {Component, Input, OnInit} from '@angular/core';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-report-detail',
  templateUrl: './ca-report-detail.component.html',
  styleUrls: ['./ca-report-detail.component.scss'],
})
export class CaReportDetailComponent implements OnInit {

  @Input() report: CaReport;

  experiments: FlArrayObs<CaExperiment>;

  constructor(private experimentService: CaExperimentService) {
  }

  ngOnInit(): void {
    this.experiments = new FlEntityArrayObs(this.experimentService.getExperimentsByReport(this.report.id));
  }

  printReport(): void {
    if (window) {
      window.print();
    }
  }
}
